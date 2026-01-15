-- ============================================
-- Store Audit Dashboard - Seed Data
-- Migration: 002_seed_stores.sql
-- Date: 2026-01-15
-- ============================================

-- Insert 43 stores from mock data
-- Status mapping: 'completed' -> 'complete', 'in-progress' -> 'in_progress'

INSERT INTO stores (id, name, location, address, floor_plan_url, manager, phone, status, created_at, updated_at) VALUES
  (gen_random_uuid(), 'Downtown Manhattan Store', 'New York, NY', '123 Broadway, New York, NY 10001', 'https://images.unsplash.com/photo-1666601088193-23415a7c6824?w=1080', 'John Smith', '(212) 555-0123', 'complete', NOW(), NOW()),
  (gen_random_uuid(), 'West LA Flagship', 'Los Angeles, CA', '456 Sunset Blvd, Los Angeles, CA 90028', 'https://images.unsplash.com/photo-1666601088193-23415a7c6824?w=1080', 'Sarah Johnson', '(310) 555-0456', 'in_progress', NOW(), NOW()),
  (gen_random_uuid(), 'Chicago Loop Center', 'Chicago, IL', '789 Michigan Ave, Chicago, IL 60601', 'https://images.unsplash.com/photo-1666601088193-23415a7c6824?w=1080', 'Michael Brown', '(312) 555-0789', 'pending', NOW(), NOW()),
  (gen_random_uuid(), 'Miami Beach Outlet', 'Miami, FL', '321 Ocean Drive, Miami Beach, FL 33139', 'https://images.unsplash.com/photo-1666601088193-23415a7c6824?w=1080', 'Emily Davis', '(305) 555-0234', 'complete', NOW(), NOW()),
  (gen_random_uuid(), 'Boston Harbor Mall', 'Boston, MA', '555 Waterfront St, Boston, MA 02109', 'https://images.unsplash.com/photo-1666601088193-23415a7c6824?w=1080', 'Robert Wilson', '(617) 555-0345', 'complete', NOW(), NOW()),
  (gen_random_uuid(), 'Seattle Pike Place', 'Seattle, WA', '100 Pike St, Seattle, WA 98101', 'https://images.unsplash.com/photo-1666601088193-23415a7c6824?w=1080', 'Jennifer Lee', '(206) 555-0567', 'in_progress', NOW(), NOW()),
  (gen_random_uuid(), 'Austin Downtown', 'Austin, TX', '200 Congress Ave, Austin, TX 78701', 'https://images.unsplash.com/photo-1666601088193-23415a7c6824?w=1080', 'David Martinez', '(512) 555-0678', 'complete', NOW(), NOW()),
  (gen_random_uuid(), 'Denver Tech Center', 'Denver, CO', '300 16th St Mall, Denver, CO 80202', 'https://images.unsplash.com/photo-1666601088193-23415a7c6824?w=1080', 'Lisa Anderson', '(303) 555-0789', 'pending', NOW(), NOW()),
  (gen_random_uuid(), 'Portland Pearl District', 'Portland, OR', '400 NW Pearl St, Portland, OR 97209', 'https://images.unsplash.com/photo-1666601088193-23415a7c6824?w=1080', 'Chris Thompson', '(503) 555-0890', 'in_progress', NOW(), NOW()),
  (gen_random_uuid(), 'Phoenix Scottsdale', 'Phoenix, AZ', '500 E Camelback Rd, Phoenix, AZ 85012', 'https://images.unsplash.com/photo-1666601088193-23415a7c6824?w=1080', 'Amanda Garcia', '(602) 555-0901', 'complete', NOW(), NOW()),
  (gen_random_uuid(), 'San Diego Gaslamp', 'San Diego, CA', '600 Fifth Ave, San Diego, CA 92101', 'https://images.unsplash.com/photo-1666601088193-23415a7c6824?w=1080', 'Kevin Rodriguez', '(619) 555-1012', 'complete', NOW(), NOW()),
  (gen_random_uuid(), 'Las Vegas Strip', 'Las Vegas, NV', '700 Las Vegas Blvd, Las Vegas, NV 89109', 'https://images.unsplash.com/photo-1666601088193-23415a7c6824?w=1080', 'Michelle White', '(702) 555-1123', 'in_progress', NOW(), NOW()),
  (gen_random_uuid(), 'Dallas Uptown', 'Dallas, TX', '800 McKinney Ave, Dallas, TX 75201', 'https://images.unsplash.com/photo-1666601088193-23415a7c6824?w=1080', 'Brian Clark', '(214) 555-1234', 'pending', NOW(), NOW()),
  (gen_random_uuid(), 'Atlanta Buckhead', 'Atlanta, GA', '900 Peachtree St, Atlanta, GA 30309', 'https://images.unsplash.com/photo-1666601088193-23415a7c6824?w=1080', 'Nicole Lewis', '(404) 555-1345', 'complete', NOW(), NOW()),
  (gen_random_uuid(), 'Minneapolis Skyway', 'Minneapolis, MN', '1000 Nicollet Mall, Minneapolis, MN 55403', 'https://images.unsplash.com/photo-1666601088193-23415a7c6824?w=1080', 'Steven Walker', '(612) 555-1456', 'in_progress', NOW(), NOW()),
  (gen_random_uuid(), 'Nashville Broadway', 'Nashville, TN', '150 Broadway, Nashville, TN 37203', 'https://images.unsplash.com/photo-1666601088193-23415a7c6824?w=1080', 'Rachel Hall', '(615) 555-1567', 'complete', NOW(), NOW()),
  (gen_random_uuid(), 'Charlotte SouthPark', 'Charlotte, NC', '250 SouthPark Center, Charlotte, NC 28210', 'https://images.unsplash.com/photo-1666601088193-23415a7c6824?w=1080', 'Daniel Allen', '(704) 555-1678', 'pending', NOW(), NOW()),
  (gen_random_uuid(), 'Pittsburgh Strip District', 'Pittsburgh, PA', '350 Smallman St, Pittsburgh, PA 15222', 'https://images.unsplash.com/photo-1666601088193-23415a7c6824?w=1080', 'Jessica Young', '(412) 555-1789', 'in_progress', NOW(), NOW()),
  (gen_random_uuid(), 'Kansas City Plaza', 'Kansas City, MO', '450 Country Club Plaza, Kansas City, MO 64112', 'https://images.unsplash.com/photo-1666601088193-23415a7c6824?w=1080', 'Matthew King', '(816) 555-1890', 'complete', NOW(), NOW()),
  (gen_random_uuid(), 'Indianapolis Circle Centre', 'Indianapolis, IN', '550 Washington St, Indianapolis, IN 46204', 'https://images.unsplash.com/photo-1666601088193-23415a7c6824?w=1080', 'Lauren Wright', '(317) 555-1901', 'complete', NOW(), NOW()),
  (gen_random_uuid(), 'Columbus Short North', 'Columbus, OH', '650 N High St, Columbus, OH 43215', 'https://images.unsplash.com/photo-1666601088193-23415a7c6824?w=1080', 'Andrew Scott', '(614) 555-2012', 'in_progress', NOW(), NOW()),
  (gen_random_uuid(), 'Milwaukee Third Ward', 'Milwaukee, WI', '750 N Broadway, Milwaukee, WI 53202', 'https://images.unsplash.com/photo-1666601088193-23415a7c6824?w=1080', 'Megan Green', '(414) 555-2123', 'pending', NOW(), NOW()),
  (gen_random_uuid(), 'Salt Lake City Downtown', 'Salt Lake City, UT', '850 S Main St, Salt Lake City, UT 84101', 'https://images.unsplash.com/photo-1666601088193-23415a7c6824?w=1080', 'Ryan Adams', '(801) 555-2234', 'complete', NOW(), NOW()),
  (gen_random_uuid(), 'San Antonio Riverwalk', 'San Antonio, TX', '950 E Commerce St, San Antonio, TX 78205', 'https://images.unsplash.com/photo-1666601088193-23415a7c6824?w=1080', 'Stephanie Baker', '(210) 555-2345', 'in_progress', NOW(), NOW()),
  (gen_random_uuid(), 'Philadelphia Rittenhouse', 'Philadelphia, PA', '1050 Walnut St, Philadelphia, PA 19107', 'https://images.unsplash.com/photo-1666601088193-23415a7c6824?w=1080', 'Jason Nelson', '(215) 555-2456', 'complete', NOW(), NOW()),
  (gen_random_uuid(), 'San Francisco Union Square', 'San Francisco, CA', '150 Powell St, San Francisco, CA 94102', 'https://images.unsplash.com/photo-1666601088193-23415a7c6824?w=1080', 'Kelly Carter', '(415) 555-2567', 'pending', NOW(), NOW()),
  (gen_random_uuid(), 'Detroit Midtown', 'Detroit, MI', '250 Woodward Ave, Detroit, MI 48226', 'https://images.unsplash.com/photo-1666601088193-23415a7c6824?w=1080', 'Brandon Mitchell', '(313) 555-2678', 'in_progress', NOW(), NOW()),
  (gen_random_uuid(), 'Baltimore Harbor East', 'Baltimore, MD', '350 Pratt St, Baltimore, MD 21202', 'https://images.unsplash.com/photo-1666601088193-23415a7c6824?w=1080', 'Christina Perez', '(410) 555-2789', 'complete', NOW(), NOW()),
  (gen_random_uuid(), 'Sacramento Downtown Plaza', 'Sacramento, CA', '450 K St, Sacramento, CA 95814', 'https://images.unsplash.com/photo-1666601088193-23415a7c6824?w=1080', 'Timothy Roberts', '(916) 555-2890', 'complete', NOW(), NOW()),
  (gen_random_uuid(), 'Tampa Channelside', 'Tampa, FL', '550 Channelside Dr, Tampa, FL 33602', 'https://images.unsplash.com/photo-1666601088193-23415a7c6824?w=1080', 'Angela Turner', '(813) 555-2901', 'in_progress', NOW(), NOW()),
  (gen_random_uuid(), 'Raleigh Downtown', 'Raleigh, NC', '650 Fayetteville St, Raleigh, NC 27601', 'https://images.unsplash.com/photo-1666601088193-23415a7c6824?w=1080', 'Gregory Phillips', '(919) 555-3012', 'pending', NOW(), NOW()),
  (gen_random_uuid(), 'St. Louis Washington Ave', 'St. Louis, MO', '750 Washington Ave, St. Louis, MO 63101', 'https://images.unsplash.com/photo-1666601088193-23415a7c6824?w=1080', 'Samantha Campbell', '(314) 555-3123', 'complete', NOW(), NOW()),
  (gen_random_uuid(), 'Cincinnati Over-the-Rhine', 'Cincinnati, OH', '850 Vine St, Cincinnati, OH 45202', 'https://images.unsplash.com/photo-1666601088193-23415a7c6824?w=1080', 'Eric Parker', '(513) 555-3234', 'in_progress', NOW(), NOW()),
  (gen_random_uuid(), 'Orlando Disney Springs', 'Orlando, FL', '950 Buena Vista Dr, Orlando, FL 32830', 'https://images.unsplash.com/photo-1666601088193-23415a7c6824?w=1080', 'Patricia Evans', '(407) 555-3345', 'complete', NOW(), NOW()),
  (gen_random_uuid(), 'Cleveland Public Square', 'Cleveland, OH', '1050 Euclid Ave, Cleveland, OH 44115', 'https://images.unsplash.com/photo-1666601088193-23415a7c6824?w=1080', 'Jonathan Edwards', '(216) 555-3456', 'pending', NOW(), NOW()),
  (gen_random_uuid(), 'Tucson 4th Avenue', 'Tucson, AZ', '150 E 4th St, Tucson, AZ 85705', 'https://images.unsplash.com/photo-1666601088193-23415a7c6824?w=1080', 'Rebecca Collins', '(520) 555-3567', 'in_progress', NOW(), NOW()),
  (gen_random_uuid(), 'Albuquerque Old Town', 'Albuquerque, NM', '250 San Felipe St, Albuquerque, NM 87104', 'https://images.unsplash.com/photo-1666601088193-23415a7c6824?w=1080', 'Mark Stewart', '(505) 555-3678', 'complete', NOW(), NOW()),
  (gen_random_uuid(), 'Honolulu Waikiki', 'Honolulu, HI', '350 Kalakaua Ave, Honolulu, HI 96815', 'https://images.unsplash.com/photo-1666601088193-23415a7c6824?w=1080', 'Karen Sanchez', '(808) 555-3789', 'complete', NOW(), NOW()),
  (gen_random_uuid(), 'Omaha Old Market', 'Omaha, NE', '450 S 10th St, Omaha, NE 68102', 'https://images.unsplash.com/photo-1666601088193-23415a7c6824?w=1080', 'Dennis Morris', '(402) 555-3890', 'in_progress', NOW(), NOW()),
  (gen_random_uuid(), 'Boise Downtown', 'Boise, ID', '550 W Main St, Boise, ID 83702', 'https://images.unsplash.com/photo-1666601088193-23415a7c6824?w=1080', 'Carol Rogers', '(208) 555-3901', 'pending', NOW(), NOW()),
  (gen_random_uuid(), 'Des Moines East Village', 'Des Moines, IA', '650 E Grand Ave, Des Moines, IA 50309', 'https://images.unsplash.com/photo-1666601088193-23415a7c6824?w=1080', 'Jerry Reed', '(515) 555-4012', 'complete', NOW(), NOW()),
  (gen_random_uuid(), 'Spokane River Park Square', 'Spokane, WA', '750 W Main Ave, Spokane, WA 99201', 'https://images.unsplash.com/photo-1666601088193-23415a7c6824?w=1080', 'Teresa Cook', '(509) 555-4123', 'in_progress', NOW(), NOW()),
  (gen_random_uuid(), 'Little Rock River Market', 'Little Rock, AR', '850 President Clinton Ave, Little Rock, AR 72201', 'https://images.unsplash.com/photo-1666601088193-23415a7c6824?w=1080', 'Gerald Morgan', '(501) 555-4234', 'complete', NOW(), NOW());
