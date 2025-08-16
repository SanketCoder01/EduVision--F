-- Comprehensive seed data for cafeterias with menu items and mess details

-- First, insert all 7 cafeterias with proper details
INSERT INTO cafeterias (name, type, address, contact_info) VALUES
('Sumit Canteen & Mess', 'cafe_mess', 'Ground Floor, Main Building', 'Contact: 9876543210 | Email: sumit@college.edu'),
('Cafe Corner (CC)', 'cafeteria', 'First Floor, Student Center', 'Contact: 9876543211 | Email: cc@college.edu'),
('HP Cafe', 'cafeteria', 'Near Library, Block A', 'Contact: 9876543212 | Email: hp@college.edu'),
('Sweet and Treats (SNT)', 'cafeteria', 'Canteen Complex, Ground Floor', 'Contact: 9876543213 | Email: snt@college.edu'),
('Bharti Mess & Cafe', 'cafe_mess', 'Hostel Block, Ground Floor', 'Contact: 9876543214 | Email: bharti@college.edu'),
('Vaishnavi', 'cafeteria', 'Academic Block B, First Floor', 'Contact: 9876543215 | Email: vaishnavi@college.edu'),
('Dibre Mess', 'mess', 'Hostel Complex, Main Building', 'Contact: 9876543216 | Email: dibre@college.edu')
ON CONFLICT (name) DO UPDATE SET
  type = EXCLUDED.type,
  address = EXCLUDED.address,
  contact_info = EXCLUDED.contact_info;

-- Add sample menu items for each cafeteria
DO $$
DECLARE
    sumit_id UUID;
    cc_id UUID;
    hp_id UUID;
    snt_id UUID;
    bharti_id UUID;
    vaishnavi_id UUID;
    dibre_id UUID;
BEGIN
    -- Get cafeteria IDs
    SELECT id INTO sumit_id FROM cafeterias WHERE name = 'Sumit Canteen & Mess';
    SELECT id INTO cc_id FROM cafeterias WHERE name = 'Cafe Corner (CC)';
    SELECT id INTO hp_id FROM cafeterias WHERE name = 'HP Cafe';
    SELECT id INTO snt_id FROM cafeterias WHERE name = 'Sweet and Treats (SNT)';
    SELECT id INTO bharti_id FROM cafeterias WHERE name = 'Bharti Mess & Cafe';
    SELECT id INTO vaishnavi_id FROM cafeterias WHERE name = 'Vaishnavi';
    SELECT id INTO dibre_id FROM cafeterias WHERE name = 'Dibre Mess';

    -- Sumit Canteen & Mess menu
    INSERT INTO menu_items (cafeteria_id, name, price, description) VALUES
    (sumit_id, 'Veg Thali', 80.00, 'Complete vegetarian meal with rice, dal, sabzi, roti'),
    (sumit_id, 'Non-Veg Thali', 120.00, 'Complete non-vegetarian meal with chicken curry'),
    (sumit_id, 'Masala Dosa', 45.00, 'Crispy dosa with potato filling and chutneys'),
    (sumit_id, 'Tea', 10.00, 'Fresh milk tea'),
    (sumit_id, 'Coffee', 15.00, 'Hot coffee'),
    (sumit_id, 'Samosa', 12.00, 'Crispy fried samosa with chutney');

    -- Cafe Corner (CC) menu
    INSERT INTO menu_items (cafeteria_id, name, price, description) VALUES
    (cc_id, 'Sandwich', 35.00, 'Grilled vegetable sandwich'),
    (cc_id, 'Burger', 55.00, 'Veg/Chicken burger with fries'),
    (cc_id, 'Pizza Slice', 40.00, 'Margherita pizza slice'),
    (cc_id, 'Cold Coffee', 25.00, 'Iced coffee with cream'),
    (cc_id, 'Maggi', 25.00, 'Instant noodles with vegetables'),
    (cc_id, 'French Fries', 30.00, 'Crispy potato fries');

    -- HP Cafe menu
    INSERT INTO menu_items (cafeteria_id, name, price, description) VALUES
    (hp_id, 'Pav Bhaji', 50.00, 'Spicy vegetable curry with bread rolls'),
    (hp_id, 'Vada Pav', 15.00, 'Mumbai street food - potato fritter in bread'),
    (hp_id, 'Misal Pav', 40.00, 'Spicy sprouts curry with bread'),
    (hp_id, 'Lassi', 20.00, 'Sweet yogurt drink'),
    (hp_id, 'Cutting Chai', 8.00, 'Half cup of tea'),
    (hp_id, 'Bhel Puri', 25.00, 'Puffed rice snack with chutneys');

    -- Sweet and Treats (SNT) menu
    INSERT INTO menu_items (cafeteria_id, name, price, description) VALUES
    (snt_id, 'Gulab Jamun', 30.00, 'Sweet milk dumplings in syrup (2 pieces)'),
    (snt_id, 'Rasgulla', 25.00, 'Spongy cottage cheese balls in syrup (2 pieces)'),
    (snt_id, 'Ice Cream', 35.00, 'Vanilla/Chocolate ice cream cup'),
    (snt_id, 'Cake Slice', 45.00, 'Fresh cake slice - various flavors'),
    (snt_id, 'Kulfi', 20.00, 'Traditional Indian ice cream'),
    (snt_id, 'Jalebi', 40.00, 'Crispy sweet spirals (250g)');

    -- Bharti Mess & Cafe menu
    INSERT INTO menu_items (cafeteria_id, name, price, description) VALUES
    (bharti_id, 'Dal Rice', 60.00, 'Simple dal with steamed rice'),
    (bharti_id, 'Rajma Chawal', 70.00, 'Kidney bean curry with rice'),
    (bharti_id, 'Chole Bhature', 65.00, 'Chickpea curry with fried bread'),
    (bharti_id, 'Paratha', 20.00, 'Stuffed Indian flatbread'),
    (bharti_id, 'Lassi', 18.00, 'Fresh yogurt drink'),
    (bharti_id, 'Pickle & Papad', 10.00, 'Side accompaniments');

    -- Vaishnavi menu
    INSERT INTO menu_items (cafeteria_id, name, price, description) VALUES
    (vaishnavi_id, 'South Indian Thali', 85.00, 'Complete South Indian meal'),
    (vaishnavi_id, 'Idli Sambar', 35.00, 'Steamed rice cakes with lentil curry (3 pieces)'),
    (vaishnavi_id, 'Uttapam', 40.00, 'Thick pancake with vegetables'),
    (vaishnavi_id, 'Filter Coffee', 18.00, 'Traditional South Indian coffee'),
    (vaishnavi_id, 'Coconut Chutney', 8.00, 'Fresh coconut chutney'),
    (vaishnavi_id, 'Rava Upma', 30.00, 'Semolina breakfast dish');

    -- Dibre Mess menu
    INSERT INTO menu_items (cafeteria_id, name, price, description) VALUES
    (dibre_id, 'Full Meal', 90.00, 'Complete traditional meal with unlimited rice'),
    (dibre_id, 'Roti Sabzi', 50.00, 'Indian bread with vegetable curry'),
    (dibre_id, 'Dal Tadka', 35.00, 'Tempered lentil curry'),
    (dibre_id, 'Curd Rice', 25.00, 'Yogurt rice with pickle'),
    (dibre_id, 'Buttermilk', 12.00, 'Spiced yogurt drink'),
    (dibre_id, 'Papad', 5.00, 'Crispy lentil wafer');

    -- Add mess details for mess-type cafeterias
    INSERT INTO mess_details (cafeteria_id, one_time_rate, two_time_rate) VALUES
    (sumit_id, 2500.00, 4200.00),
    (bharti_id, 2800.00, 4500.00),
    (dibre_id, 2200.00, 3800.00)
    ON CONFLICT (cafeteria_id) DO UPDATE SET
      one_time_rate = EXCLUDED.one_time_rate,
      two_time_rate = EXCLUDED.two_time_rate;

END $$;
