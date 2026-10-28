-- LifeCare Connect Demo Database
-- PostgreSQL / Netlify Database compatible schema
-- Medical values are DEMO values for testing the website only.

CREATE TABLE IF NOT EXISTS residents (
    resident_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    age INTEGER NOT NULL,
    gender VARCHAR(20) NOT NULL,
    disease VARCHAR(150),
    medicine VARCHAR(150),
    medicine_time VARCHAR(30),
    medicine_over DATE,
    quantity INTEGER,
    need_order BOOLEAN DEFAULT FALSE,
    phone VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS medical_surveys (
    survey_id SERIAL PRIMARY KEY,
    resident_id INTEGER NOT NULL REFERENCES residents(resident_id) ON DELETE CASCADE,
    survey_date DATE NOT NULL,
    doctor_name VARCHAR(100) NOT NULL,
    blood_pressure VARCHAR(20),
    sugar_level DECIMAL(6,2),
    sugar_type VARCHAR(30) DEFAULT 'Fasting',
    temperature DECIMAL(4,1),
    pulse_rate INTEGER,
    weight_kg DECIMAL(5,2),
    symptoms TEXT,
    doctor_remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO residents
(name, age, gender, disease, medicine, medicine_time, medicine_over, quantity, need_order, phone)
VALUES
('Anita Sharma',74,'Female','Type 2 Diabetes','Metformin','08:00 AM','2026-09-20',18,FALSE,'9000000001'),
('Meena Joshi',81,'Female','Hypertension','Amlodipine','09:00 AM','2026-09-18',12,FALSE,'9000000002'),
('Sunita Verma',69,'Female','Arthritis','Paracetamol','08:30 PM','2026-09-12',8,TRUE,'9000000003'),
('Kamla Rao',77,'Female','Asthma','Inhaler','07:30 AM','2026-09-25',6,TRUE,'9000000004'),
('Ramesh Patil',72,'Male','Osteoporosis','Calcium + Vitamin D','10:00 AM','2026-10-02',25,FALSE,'9000000005'),
('Mohan Kulkarni',85,'Male','High Cholesterol','Atorvastatin','09:00 PM','2026-09-28',20,FALSE,'9000000006'),
('Vijay More',67,'Male','Hypothyroidism','Levothyroxine','06:30 AM','2026-09-30',30,FALSE,'9000000007'),
('Shankar Deshmukh',79,'Male','Knee Pain','Pain relief','08:00 PM','2026-09-15',7,TRUE,'9000000008'),
('Dattatray Borkar',83,'Male','Diabetes','Metformin','08:00 AM','2026-10-05',22,FALSE,'9000000009'),
('Arun Nair',71,'Other','Hypertension','Telmisartan','09:30 AM','2026-09-22',14,FALSE,'9000000010');

INSERT INTO medical_surveys
(resident_id, survey_date, doctor_name, blood_pressure, sugar_level, sugar_type, temperature, pulse_rate, weight_kg, symptoms, doctor_remarks)
VALUES
((SELECT resident_id FROM residents WHERE name='Anita Sharma'),'2026-10-02','Dr. Amit Patil','138/86',168,'Fasting',98.2,78,62,'Increased thirst, frequent urination, mild fatigue','Type 2 diabetes. Continue prescribed treatment and monitor fasting blood sugar regularly.'),
((SELECT resident_id FROM residents WHERE name='Meena Joshi'),'2026-10-02','Dr. Neha Deshmukh','154/92',102,'Fasting',98.1,82,64,'Occasional headache, dizziness','Hypertension noted. Continue prescribed treatment and monitor blood pressure regularly.'),
((SELECT resident_id FROM residents WHERE name='Sunita Verma'),'2026-10-02','Dr. Rahul Kulkarni','132/84',105,'Fasting',98.4,76,60,'Joint pain, stiffness, difficulty walking','Arthritis symptoms noted. Continue prescribed treatment and gentle activity as tolerated.'),
((SELECT resident_id FROM residents WHERE name='Kamla Rao'),'2026-10-02','Dr. Priya Joshi','128/82',98,'Fasting',98.0,80,58,'Occasional breathlessness, wheezing','Asthma symptoms noted. Continue inhaler as prescribed and monitor breathing difficulty.'),
((SELECT resident_id FROM residents WHERE name='Ramesh Patil'),'2026-10-02','Dr. Amit Patil','130/84',100,'Fasting',98.2,74,70,'Bone and joint discomfort, mild weakness','Osteoporosis management ongoing. Continue prescribed treatment and fall precautions.'),
((SELECT resident_id FROM residents WHERE name='Mohan Kulkarni'),'2026-10-02','Dr. Neha Deshmukh','136/86',104,'Fasting',98.3,72,68,'Occasional fatigue, no major symptoms','High cholesterol under treatment. Continue prescribed treatment and heart-healthy diet.'),
((SELECT resident_id FROM residents WHERE name='Vijay More'),'2026-10-02','Dr. Rahul Kulkarni','126/80',99,'Fasting',98.1,70,65,'Fatigue, sensitivity to cold','Hypothyroidism under treatment. Continue prescribed treatment and regular follow-up.'),
((SELECT resident_id FROM residents WHERE name='Shankar Deshmukh'),'2026-10-02','Dr. Priya Joshi','134/84',101,'Fasting',98.2,78,72,'Knee pain, difficulty climbing stairs','Knee pain reported. Continue prescribed treatment and avoid excessive strain.'),
((SELECT resident_id FROM residents WHERE name='Dattatray Borkar'),'2026-10-02','Dr. Amit Patil','140/88',182,'Fasting',98.5,80,74,'Increased thirst, fatigue','Diabetes requires regular monitoring. Continue prescribed treatment and monitor fasting blood sugar.'),
((SELECT resident_id FROM residents WHERE name='Arun Nair'),'2026-10-02','Dr. Neha Deshmukh','150/90',106,'Fasting',98.2,84,67,'Occasional headache, dizziness','Hypertension noted. Continue prescribed treatment and monitor blood pressure regularly.');

-- Combined view for the Medical Surveys page
CREATE OR REPLACE VIEW medical_survey_details AS
SELECT r.name, r.age, r.gender, r.disease, r.medicine, r.medicine_time,
       m.survey_date, m.doctor_name, m.blood_pressure, m.sugar_level,
       m.sugar_type, m.temperature, m.pulse_rate, m.weight_kg,
       m.symptoms, m.doctor_remarks
FROM residents r
JOIN medical_surveys m ON m.resident_id = r.resident_id;


-- Emergency Support
CREATE TABLE IF NOT EXISTS emergency_reports (
    emergency_id SERIAL PRIMARY KEY,
    resident_id INTEGER NOT NULL REFERENCES residents(resident_id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active','Responding','Resolved')),
    report TEXT,
    handled_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ashram location used by the dashboards
CREATE TABLE IF NOT EXISTS ashram_location (
    location_id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    address VARCHAR(255) NOT NULL
);

INSERT INTO ashram_location (name, address)
SELECT 'Shree Gadge Maharaj Vrudhashram', 'Shree Gadge Maharaj Vrudhashram, Amravati'
WHERE NOT EXISTS (SELECT 1 FROM ashram_location);


-- Emergency email/message audit log for the browser prototype / future backend integration
CREATE TABLE IF NOT EXISTS emergency_messages (
    message_id SERIAL PRIMARY KEY,
    resident_id INTEGER REFERENCES residents(resident_id) ON DELETE SET NULL,
    message_type VARCHAR(60) NOT NULL,
    sender_email VARCHAR(150) NOT NULL,
    recipient_email VARCHAR(150) NOT NULL,
    subject VARCHAR(255),
    delivery_status VARCHAR(50) DEFAULT 'Email compose opened',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
