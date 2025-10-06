-- Expense Sharing System for EduVision
-- Create tables for expense management

-- Enable necessary extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist
DROP TABLE IF EXISTS expense_groups CASCADE;
DROP TABLE IF EXISTS expense_group_members CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS expense_shares CASCADE;
DROP TABLE IF EXISTS expense_settlements CASCADE;

-- Create expense_groups table
CREATE TABLE expense_groups (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by UUID NOT NULL,
    department VARCHAR(100) NOT NULL,
    target_years TEXT[] DEFAULT '{}',
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_created_by
        FOREIGN KEY (created_by) 
        REFERENCES auth.users(id)
        ON DELETE CASCADE
);

-- Create expense_group_members table
CREATE TABLE expense_group_members (
    group_id UUID NOT NULL,
    user_id UUID NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT false,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (group_id, user_id),
    CONSTRAINT fk_group
        FOREIGN KEY (group_id) 
        REFERENCES expense_groups(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_user
        FOREIGN KEY (user_id) 
        REFERENCES auth.users(id)
        ON DELETE CASCADE
);

-- Create expenses table
CREATE TABLE expenses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    group_id UUID NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    paid_by UUID NOT NULL,
    paid_by_name VARCHAR(255) NOT NULL,
    category VARCHAR(50) CHECK (category IN ('food', 'travel', 'utilities', 'entertainment', 'education', 'shopping', 'other')) DEFAULT 'other',
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    receipt_url TEXT,
    notes TEXT,
    CONSTRAINT fk_group
        FOREIGN KEY (group_id) 
        REFERENCES expense_groups(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_paid_by
        FOREIGN KEY (paid_by) 
        REFERENCES auth.users(id)
        ON DELETE CASCADE
);

-- Create expense_shares table
CREATE TABLE expense_shares (
    expense_id UUID NOT NULL,
    user_id UUID NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    share_amount DECIMAL(10, 2) NOT NULL,
    is_settled BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (expense_id, user_id),
    CONSTRAINT fk_expense
        FOREIGN KEY (expense_id) 
        REFERENCES expenses(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_user
        FOREIGN KEY (user_id) 
        REFERENCES auth.users(id)
        ON DELETE CASCADE
);

-- Create expense_settlements table
CREATE TABLE expense_settlements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    group_id UUID NOT NULL,
    from_user_id UUID NOT NULL,
    to_user_id UUID NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    settled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    payment_method VARCHAR(50) DEFAULT 'cash',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_group
        FOREIGN KEY (group_id) 
        REFERENCES expense_groups(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_from_user
        FOREIGN KEY (from_user_id) 
        REFERENCES auth.users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_to_user
        FOREIGN KEY (to_user_id) 
        REFERENCES auth.users(id)
        ON DELETE CASCADE
);

-- Enable RLS (Row Level Security)
ALTER TABLE expense_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_settlements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for expense_groups
CREATE POLICY "Users can view public groups" ON expense_groups
    FOR SELECT USING (is_public = true);

CREATE POLICY "Group members can view their groups" ON expense_groups
    FOR SELECT USING (
        id IN (
            SELECT group_id FROM expense_group_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Group admins can manage their groups" ON expense_groups
    FOR ALL USING (
        created_by = auth.uid() OR
        id IN (
            SELECT group_id FROM expense_group_members 
            WHERE user_id = auth.uid() AND is_admin = true
        )
    );

-- RLS Policies for expense_group_members
CREATE POLICY "Group members can view group members" ON expense_group_members
    FOR SELECT USING (
        group_id IN (
            SELECT group_id FROM expense_group_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Group admins can manage group members" ON expense_group_members
    FOR ALL USING (
        group_id IN (
            SELECT group_id FROM expense_group_members 
            WHERE user_id = auth.uid() AND is_admin = true
        )
    );

-- RLS Policies for expenses
CREATE POLICY "Users can view their expenses" ON expenses
    FOR SELECT USING (
        group_id IN (
            SELECT group_id FROM expense_group_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create expenses in their groups" ON expenses
    FOR INSERT WITH CHECK (
        group_id IN (
            SELECT group_id FROM expense_group_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Expense creators can update/delete their expenses" ON expenses
    FOR ALL USING (paid_by = auth.uid());

-- RLS Policies for expense_shares
CREATE POLICY "Users can view their expense shares" ON expense_shares
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view shares for their group expenses" ON expense_shares
    FOR SELECT USING (
        expense_id IN (
            SELECT id FROM expenses 
            WHERE group_id IN (
                SELECT group_id FROM expense_group_members 
                WHERE user_id = auth.uid()
            )
        )
    );

-- RLS Policies for expense_settlements
CREATE POLICY "Users can view their settlements" ON expense_settlements
    FOR SELECT USING (from_user_id = auth.uid() OR to_user_id = auth.uid());

CREATE POLICY "Users can create settlements" ON expense_settlements
    FOR INSERT WITH CHECK (from_user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX idx_expenses_group_id ON expenses(group_id);
CREATE INDEX idx_expenses_paid_by ON expenses(paid_by);
CREATE INDEX idx_expense_shares_expense_id ON expense_shares(expense_id);
CREATE INDEX idx_expense_shares_user_id ON expense_shares(user_id);
CREATE INDEX idx_expense_settlements_group_id ON expense_settlements(group_id);
CREATE INDEX idx_expense_settlements_from_user ON expense_settlements(from_user_id);
CREATE INDEX idx_expense_settlements_to_user ON expense_settlements(to_user_id);

-- Enable realtime for expense groups and expenses
ALTER PUBLICATION supabase_realtime ADD TABLE expense_groups;
ALTER PUBLICATION supabase_realtime ADD TABLE expenses;
ALTER PUBLICATION supabase_realtime ADD TABLE expense_shares;
ALTER PUBLICATION supabase_realtime ADD TABLE expense_settlements;

-- Create a function to notify when a new expense is added
CREATE OR REPLACE FUNCTION notify_new_expense()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM pg_notify(
        'new_expense',
        json_build_object(
            'group_id', NEW.group_id,
            'expense_id', NEW.id,
            'amount', NEW.amount,
            'currency', NEW.currency,
            'paid_by', NEW.paid_by,
            'description', NEW.description
        )::text
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger for new expenses
CREATE TRIGGER on_expense_created
AFTER INSERT ON expenses
FOR EACH ROW EXECUTE FUNCTION notify_new_expense();

-- Create a function to notify when a settlement is made
CREATE OR REPLACE FUNCTION notify_settlement()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM pg_notify(
        'expense_settled',
        json_build_object(
            'group_id', NEW.group_id,
            'from_user_id', NEW.from_user_id,
            'to_user_id', NEW.to_user_id,
            'amount', NEW.amount,
            'currency', NEW.currency
        )::text
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger for new settlements
CREATE TRIGGER on_settlement_created
AFTER INSERT ON expense_settlements
FOR EACH ROW EXECUTE FUNCTION notify_settlement();

-- Create a function to calculate balances
CREATE OR REPLACE FUNCTION calculate_balances(group_id_param UUID, user_id_param UUID DEFAULT NULL)
RETURNS TABLE (
    user_id UUID,
    user_email VARCHAR,
    user_name VARCHAR,
    total_paid DECIMAL(10, 2),
    total_owed DECIMAL(10, 2),
    balance DECIMAL(10, 2)
) AS $$
BEGIN
    RETURN QUERY
    WITH 
    -- Get all members of the group
    members AS (
        SELECT user_id, user_email, user_name 
        FROM expense_group_members 
        WHERE group_id = group_id_param
    ),
    -- Calculate total paid by each member
    paid AS (
        SELECT 
            e.paid_by as user_id,
            COALESCE(SUM(e.amount), 0) as total
        FROM expenses e
        WHERE e.group_id = group_id_param
        GROUP BY e.paid_by
    ),
    -- Calculate total owed by each member
    owed AS (
        SELECT 
            es.user_id,
            COALESCE(SUM(es.share_amount), 0) as total
        FROM expense_shares es
        JOIN expenses e ON es.expense_id = e.id
        WHERE e.group_id = group_id_param
        GROUP BY es.user_id
    ),
    -- Calculate settlements
    settled AS (
        SELECT 
            from_user_id as user_id,
            -SUM(amount) as amount
        FROM expense_settlements
        WHERE group_id = group_id_param
        GROUP BY from_user_id
        
        UNION ALL
        
        SELECT 
            to_user_id as user_id,
            SUM(amount) as amount
        FROM expense_settlements
        WHERE group_id = group_id_param
        GROUP BY to_user_id
    ),
    -- Calculate net settlements
    net_settled AS (
        SELECT 
            user_id,
            SUM(amount) as total
        FROM settled
        GROUP BY user_id
    )
    -- Combine all calculations
    SELECT 
        m.user_id,
        m.user_email,
        m.user_name,
        COALESCE(p.total, 0) as total_paid,
        COALESCE(o.total, 0) as total_owed,
        (COALESCE(p.total, 0) - COALESCE(o.total, 0) + COALESCE(s.total, 0)) as balance
    FROM members m
    LEFT JOIN paid p ON m.user_id = p.user_id
    LEFT JOIN owed o ON m.user_id = o.user_id
    LEFT JOIN net_settled s ON m.user_id = s.user_id
    WHERE user_id_param IS NULL OR m.user_id = user_id_param;
END;
$$ LANGUAGE plpgsql;
