-- AutoTransport Dashboard — Seed Data
-- Run this AFTER migration.sql

-- ─── Carriers ──────────────────────────────────────
insert into carriers (id, name, mc_number, dot_number, contact_name, contact_phone, contact_email, rating, total_deliveries, on_time_percentage, insurance_expiry) values
  ('car_01', 'Swift Auto Carriers', 'MC-784523', 'DOT-3291847', 'Mike Reynolds', '(305) 555-0147', 'dispatch@swiftauto.com', 4.8, 342, 96, '2027-03-15'),
  ('car_02', 'Pacific Transport LLC', 'MC-651289', 'DOT-2847561', 'Sarah Chen', '(415) 555-0293', 'ops@pacifictransport.com', 4.6, 218, 93, '2026-11-30'),
  ('car_03', 'Heartland Auto Movers', 'MC-892341', 'DOT-4129503', 'Tom Bradley', '(312) 555-0184', 'tom@heartlandauto.com', 4.9, 567, 98, '2027-06-22'),
  ('car_04', 'Coastal Vehicle Logistics', 'MC-412876', 'DOT-1983724', 'Jennifer Watts', '(904) 555-0331', 'jen@coastalvl.com', 4.3, 129, 89, '2026-09-10'),
  ('car_05', 'Summit Express Transport', 'MC-567432', 'DOT-3847291', 'David Park', '(720) 555-0219', 'david@summitexpress.com', 4.7, 421, 95, '2027-01-18')
on conflict (id) do nothing;

-- ─── Orders ────────────────────────────────────────
insert into orders (id, order_number, status, customer_name, customer_email, customer_phone, vehicle_year, vehicle_make, vehicle_model, vehicle_vin, vehicle_condition, origin_city, origin_state, origin_zip, destination_city, destination_state, destination_zip, distance_miles, carrier_id, carrier_name, driver_name, driver_phone, price, deposit, balance_due, is_paid, stripe_payment_id, hubspot_deal_id, central_dispatch_id, pickup_date, delivery_date, estimated_delivery, notes, created_at, updated_at) values
  ('ord_01','AT-10234','delivered','James Morrison','james.m@email.com','(212) 555-0891',2022,'BMW','X5','5UXCR6C05N9K78432','running','New York','NY','10001','Miami','FL','33101',1280,'car_01','Swift Auto Carriers','Carlos Mendez','(786) 555-0412',1450,350,0,true,'pi_3N9kJ2dS8f7h','hs_deal_8829','CD-772841',now()-interval '7 days',now()-interval '2 days',now()-interval '3 days','Customer requested enclosed transport. Delivered in excellent condition.',now()-interval '10 days',now()-interval '2 days'),
  ('ord_02','AT-10235','in_transit','Lisa Chen','lisa.chen@email.com','(415) 555-0723',2023,'Tesla','Model 3','5YJ3E1EA3NF29817','running','San Francisco','CA','94102','Seattle','WA','98101',808,'car_02','Pacific Transport LLC','Kevin Park','(503) 555-0187',950,250,700,true,'pi_4M8nK3eT9g2i','hs_deal_8834','CD-773102',now()-interval '2 days',null,now()+interval '2 days','EV — must remain on upper rack.',now()-interval '5 days',now()-interval '6 hours'),
  ('ord_03','AT-10236','picked_up','Robert Williams','r.williams@email.com','(773) 555-0482',2021,'Ford','Mustang GT','1FA6P8CF2M5122847','running','Chicago','IL','60601','Denver','CO','80201',1003,'car_03','Heartland Auto Movers','Bill Watson','(816) 555-0291',1100,300,800,true,'pi_5L7mN4fU0h3j','hs_deal_8841','CD-773287',now()-interval '8 hours',null,now()+interval '3 days','Sports car — handle with care.',now()-interval '4 days',now()-interval '8 hours'),
  ('ord_04','AT-10237','dispatched','Amanda Torres','amanda.t@email.com','(602) 555-0319',2020,'Toyota','Camry','4T1BF1FK5LU30892','running','Phoenix','AZ','85001','Dallas','TX','75201',1065,'car_05','Summit Express Transport','Marcus Johnson','(505) 555-0443',875,200,675,true,'pi_6K9oP5gV1i4k','hs_deal_8847','CD-773401',null,null,now()+interval '5 days','Standard sedan transport.',now()-interval '2 days',now()-interval '1 day'),
  ('ord_05','AT-10238','booked','David Kim','david.kim@email.com','(310) 555-0567',2024,'Porsche','911 Carrera','WP0AB2A99RS22718','running','Los Angeles','CA','90001','Las Vegas','NV','89101',270,null,null,null,null,750,200,550,true,'pi_7J0pQ6hW2j5l','hs_deal_8852',null,null,null,now()+interval '7 days','Enclosed transport ONLY. High-value vehicle.',now()-interval '1 day',now()-interval '1 day'),
  ('ord_06','AT-10239','booked','Sarah Mitchell','sarah.m@email.com','(404) 555-0891',2019,'Honda','CR-V','2HKRW2H52KH68923','running','Atlanta','GA','30301','Nashville','TN','37201',248,null,null,null,null,525,150,375,true,'pi_8I1qR7iX3k6m','hs_deal_8855',null,null,null,now()+interval '6 days','Short haul. Customer flexible on dates.',now()-interval '12 hours',now()-interval '12 hours'),
  ('ord_07','AT-10240','delivered','Michael Brown','m.brown@email.com','(617) 555-0234',2021,'Chevrolet','Tahoe','1GNSKBKD8MR38291','running','Boston','MA','02101','Charlotte','NC','28201',840,'car_03','Heartland Auto Movers','Jake Torres','(704) 555-0182',1050,275,0,true,'pi_9H2rS8jY4l7n','hs_deal_8820','CD-772512',now()-interval '12 days',now()-interval '8 days',now()-interval '9 days','Large SUV. Delivered without issues.',now()-interval '15 days',now()-interval '8 days'),
  ('ord_08','AT-10241','in_transit','Emily Davis','emily.d@email.com','(503) 555-0678',2023,'Audi','Q7','WA1LAAF72PD09283','running','Portland','OR','97201','Salt Lake City','UT','84101',768,'car_05','Summit Express Transport','Ryan Cole','(208) 555-0391',925,225,700,true,'pi_0G3sT9kZ5m8o','hs_deal_8838','CD-773198',now()-interval '1 day',null,now()+interval '1 day','Premium SUV. Enclosed transport.',now()-interval '3 days',now()-interval '14 hours')
on conflict (id) do nothing;

-- ─── Status History ────────────────────────────────
insert into status_history (id, order_id, order_number, from_status, to_status, changed_by, notes, created_at) values
  ('sh_01','ord_01','AT-10234',null,'booked','HubSpot Webhook','Order created from HubSpot deal hs_deal_8829',now()-interval '10 days'),
  ('sh_02','ord_01','AT-10234','booked','dispatched','System','Carrier assigned: Swift Auto Carriers',now()-interval '8 days'),
  ('sh_03','ord_01','AT-10234','dispatched','picked_up','Central Dispatch Polling','Vehicle picked up via Central Dispatch',now()-interval '7 days'),
  ('sh_04','ord_01','AT-10234','picked_up','in_transit','System','Auto-transitioned after pickup',now()-interval '7 days'),
  ('sh_05','ord_01','AT-10234','in_transit','delivered','Central Dispatch Polling','Delivery confirmed via Central Dispatch',now()-interval '2 days'),
  ('sh_06','ord_03','AT-10236',null,'booked','HubSpot Webhook','Order created from HubSpot deal hs_deal_8841',now()-interval '4 days'),
  ('sh_07','ord_03','AT-10236','booked','dispatched','System','Carrier assigned: Heartland Auto Movers',now()-interval '3 days'),
  ('sh_08','ord_03','AT-10236','dispatched','picked_up','Central Dispatch Polling','Vehicle picked up via Central Dispatch',now()-interval '8 hours'),
  ('sh_09','ord_05','AT-10238',null,'booked','HubSpot Webhook','Order created from HubSpot deal hs_deal_8852',now()-interval '1 day')
on conflict (id) do nothing;

-- ─── Activities ────────────────────────────────────
insert into activities (id, type, title, description, order_id, order_number, created_at) values
  ('act_01','status_change','Vehicle Picked Up','2021 Ford Mustang GT picked up in Chicago, IL','ord_03','AT-10236',now()-interval '8 hours'),
  ('act_02','notification','SMS Sent','Pickup notification sent to Robert Williams','ord_03','AT-10236',now()-interval '8 hours'),
  ('act_03','status_change','In Transit Update','2023 Tesla Model 3 — currently in transit to Seattle, WA','ord_02','AT-10235',now()-interval '6 hours'),
  ('act_04','new_order','New Order Created','2024 Porsche 911 Carrera — Los Angeles, CA → Las Vegas, NV','ord_05','AT-10238',now()-interval '1 day'),
  ('act_05','payment','Deposit Received','$200 deposit received via Stripe for order AT-10238','ord_05','AT-10238',now()-interval '1 day'),
  ('act_06','status_change','Carrier Dispatched','Summit Express Transport assigned to AT-10237','ord_04','AT-10237',now()-interval '1 day'),
  ('act_07','new_order','New Order Created','2019 Honda CR-V — Atlanta, GA → Nashville, TN','ord_06','AT-10239',now()-interval '12 hours'),
  ('act_08','status_change','Vehicle Delivered','2022 BMW X5 delivered to Miami, FL','ord_01','AT-10234',now()-interval '2 days')
on conflict (id) do nothing;

-- ─── Notifications ─────────────────────────────────
insert into notifications (id, order_id, order_number, type, recipient, subject, message, status, provider, created_at) values
  ('notif_01','ord_01','AT-10234','sms','(212) 555-0891','Vehicle Delivered','Hi James, your 2022 BMW X5 has been delivered to Miami, FL.','sent','twilio',now()-interval '2 days'),
  ('notif_02','ord_01','AT-10234','email','james.m@email.com','Your Vehicle Has Been Delivered — AT-10234','Dear James, your 2022 BMW X5 has been successfully delivered.','sent','resend',now()-interval '2 days'),
  ('notif_03','ord_03','AT-10236','sms','(773) 555-0482','Vehicle Picked Up','Hi Robert, your 2021 Ford Mustang GT has been picked up.','sent','twilio',now()-interval '8 hours'),
  ('notif_04','ord_03','AT-10236','email','r.williams@email.com','Your Vehicle Has Been Picked Up — AT-10236','Dear Robert, your 2021 Ford Mustang GT has been picked up.','sent','resend',now()-interval '8 hours'),
  ('notif_05','ord_02','AT-10235','sms','(415) 555-0723','Vehicle In Transit','Hi Lisa, your 2023 Tesla Model 3 is in transit to Seattle, WA.','sent','twilio',now()-interval '6 hours'),
  ('notif_06','ord_05','AT-10238','email','david.kim@email.com','Booking Confirmed — AT-10238','Dear David, your transport order has been confirmed.','sent','resend',now()-interval '1 day'),
  ('notif_07','ord_04','AT-10237','sms','(602) 555-0319','Carrier Dispatched','Hi Amanda, a carrier has been assigned to your order.','sent','twilio',now()-interval '1 day')
on conflict (id) do nothing;
