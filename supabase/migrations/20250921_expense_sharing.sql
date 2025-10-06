-- Create enum types
create type expense_split_type as enum ('EQUAL', 'EXACT', 'PERCENTAGE', 'SHARES');
create type settlement_status as enum ('pending', 'completed', 'cancelled');

-- Create tables
create table expenses (
  id uuid default gen_random_uuid() primary key,
  description text not null,
  amount numeric(10, 2) not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  group_id uuid references groups(id) on delete set null,
  split_type expense_split_type not null default 'EQUAL',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table expense_participants (
  id uuid default gen_random_uuid() primary key,
  expense_id uuid references expenses(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  amount_owed numeric(10, 2) not null,
  is_settled boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(expense_id, user_id)
);

create table expense_settlements (
  id uuid default gen_random_uuid() primary key,
  from_user_id uuid references auth.users(id) on delete cascade not null,
  to_user_id uuid references auth.users(id) on delete cascade not null,
  amount numeric(10, 2) not null,
  status settlement_status not null default 'completed',
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  settled_at timestamp with time zone
);

-- Enable Row Level Security
alter table expenses enable row level security;
alter table expense_participants enable row level security;
alter table expense_settlements enable row level security;

-- Create policies for expenses
create policy "Users can view their own expenses"
  on expenses for select
  using (auth.uid() = user_id or 
         exists (
           select 1 from expense_participants 
           where expense_participants.expense_id = expenses.id 
           and expense_participants.user_id = auth.uid()
         )
        );

create policy "Users can insert their own expenses"
  on expenses for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own expenses"
  on expenses for update
  using (auth.uid() = user_id);

create policy "Users can delete their own expenses"
  on expenses for delete
  using (auth.uid() = user_id);

-- Create policies for expense_participants
create policy "Users can view participants of their expenses"
  on expense_participants for select
  using (
    auth.uid() in (
      select user_id from expenses where id = expense_participants.expense_id
    )
    or auth.uid() = user_id
  );

create policy "Expense creators can add participants"
  on expense_participants for insert
  with check (
    exists (
      select 1 from expenses 
      where id = expense_participants.expense_id 
      and user_id = auth.uid()
    )
  );

-- Create policies for expense_settlements
create policy "Users can view their settlements"
  on expense_settlements for select
  using (auth.uid() = from_user_id or auth.uid() = to_user_id);

create policy "Users can create settlements involving themselves"
  on expense_settlements for insert
  with check (auth.uid() = from_user_id or auth.uid() = to_user_id);

-- Create indexes for better performance
create index idx_expenses_user_id on expenses(user_id);
create index idx_expense_participants_expense_id on expense_participants(expense_id);
create index idx_expense_participants_user_id on expense_participants(user_id);
create index idx_expense_settlements_from_user_id on expense_settlements(from_user_id);
create index idx_expense_settlements_to_user_id on expense_settlements(to_user_id);

-- Create function to update timestamps
create or replace function update_modified_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger update_expenses_modtime
  before update on expenses
  for each row
  execute function update_modified_column();

create trigger update_expense_participants_modtime
  before update on expense_participants
  for each row
  execute function update_modified_column();

create trigger update_expense_settlements_modtime
  before update on expense_settlements
  for each row
  execute function update_modified_column();

-- Create a function to calculate balances between users
create or replace function get_user_balances(user_id_param uuid)
returns table (
  user_id uuid,
  full_name text,
  avatar_url text,
  net_balance numeric(10, 2),
  you_owe numeric(10, 2),
  you_are_owed numeric(10, 2)
) as $$
begin
  return query
  with 
  -- Calculate what the user owes to others
  user_owes as (
    select 
      p.user_id,
      sum(p.amount_owed) as amount
    from expense_participants p
    join expenses e on p.expense_id = e.id
    where p.user_id = user_id_param
    and not exists (
      select 1 from expense_settlements s 
      where s.from_user_id = p.user_id 
      and s.to_user_id = e.user_id
      and s.status = 'completed'
      and s.amount >= p.amount_owed
    )
    group by p.user_id
  ),
  
  -- Calculate what others owe to the user
  user_is_owed as (
    select 
      e.user_id,
      sum(p.amount_owed) as amount
    from expense_participants p
    join expenses e on p.expense_id = e.id
    where e.user_id = user_id_param
    and p.user_id != user_id_param
    and not exists (
      select 1 from expense_settlements s 
      where s.from_user_id = p.user_id 
      and s.to_user_id = e.user_id
      and s.status = 'completed'
      and s.amount >= p.amount_owed
    )
    group by e.user_id
  ),
  
  -- Combine all users who have transactions with the current user
  all_users as (
    select 
      u.id as user_id,
      u.raw_user_meta_data->>'full_name' as full_name,
      u.raw_user_meta_data->>'avatar_url' as avatar_url,
      coalesce(owes.amount, 0) as owes_amount,
      coalesce(owed.amount, 0) as owed_amount
    from auth.users u
    left join user_owes owes on u.id = owes.user_id
    left join user_is_owed owed on u.id = owed.user_id
    where u.id != user_id_param
    and (owes.amount is not null or owed.amount is not null)
  )
  
  select 
    au.user_id,
    au.full_name,
    au.avatar_url,
    (au.owed_amount - au.owes_amount) as net_balance,
    au.owes_amount as you_owe,
    au.owed_amount as you_are_owed
  from all_users au
  where (au.owed_amount - au.owes_amount) != 0
  order by abs(au.owed_amount - au.owes_amount) desc;
end;
$$ language plpgsql security definer;

-- Grant permissions to authenticated users
grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant execute on all functions in schema public to authenticated;
