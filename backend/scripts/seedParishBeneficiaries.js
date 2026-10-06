const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const parishBeneficiaries = [
  // ==========================================
  // 1. STUDENT SCHOLARSHIPS (Student Scholars)
  // ==========================================
  { name: 'Jvon Angelo G. Valiente', phone: '09458464560', sectorGroup: 'Student Scholarships', address: '119-2 Kaliraya St., Brgy. Tatalon, Q.C.' },
  { name: 'Gian Dennis D. Serna', phone: '09950358630', sectorGroup: 'Student Scholarships', address: '119 Kaliraya St., Brgy. Tatalon, Q.C.' },
  { name: 'Elljay E. Bermales', phone: '09565418528', sectorGroup: 'Student Scholarships', address: '119 Kaliraya St., Brgy. Tatalon, Q.C.' },
  { name: 'Keim Zyril Abeciar', phone: '09392875401', sectorGroup: 'Student Scholarships', address: '46 Agno Ext., Tatalon, Q.C.' },
  { name: 'Jamaica Rose Carey', phone: '09457644557', sectorGroup: 'Student Scholarships', address: '66 Agno Ext., Tatalon, Q.C.' },
  { name: 'Trishe L. Libradilla', phone: '09457644558', sectorGroup: 'Student Scholarships', address: '66 Agno Ext., Tatalon, Q.C.' },
  { name: 'Hannah Ysabell A. Velasco', phone: '09174171246', sectorGroup: 'Student Scholarships', address: '119 Kaliraya St. L-12, Tatalon, Q.C.' },
  { name: 'Gemma D. Padao', phone: '09931498011', sectorGroup: 'Student Scholarships', address: 'C-20 Tagupo St., Tatalon, Q.C.' },
  { name: 'Rhian D. Padao', phone: '09458712473', sectorGroup: 'Student Scholarships', address: 'C-20 Tagupo St., Tatalon, Q.C.' },
  { name: 'Justin B. Aliganga', phone: '09458712474', sectorGroup: 'Student Scholarships', address: 'C-20 Tagupo St., Tatalon, Q.C.' },
  { name: 'Prince Leonard Toledo', phone: '09451886064', sectorGroup: 'Student Scholarships', address: '86 Kaliraya St. L-12, Tatalon, Q.C.' },
  { name: 'Prince Ashton S. Habulin', phone: '09310944516', sectorGroup: 'Student Scholarships', address: '86 Kaliraya St. L-12, Tatalon, Q.C.' },
  { name: 'Diamian Miley Dulva', phone: '09216182087', sectorGroup: 'Student Scholarships', address: '31 Alagao St., Victory Ave., Q.C.' },
  { name: 'Joylyn Candace Artos', phone: '09216182088', sectorGroup: 'Student Scholarships', address: '31 Alagao St., Victory Ave., Q.C.' },
  { name: 'Joe Devance Artos', phone: '09216182089', sectorGroup: 'Student Scholarships', address: '31 Alagao St., Victory Ave., Q.C.' },
  { name: 'Steve Francis Santayana', phone: '09216182090', sectorGroup: 'Student Scholarships', address: '31 Alagao St., Victory Ave., Q.C.' },
  { name: 'Carl James Dulva', phone: '09216182091', sectorGroup: 'Student Scholarships', address: '31 Alagao St., Victory Ave., Q.C.' },
  { name: 'King Michael Perer', phone: '09216182092', sectorGroup: 'Student Scholarships', address: 'Duhat, Tatalon, Q.C.' },
  { name: 'Mark Keil Perer', phone: '09216182093', sectorGroup: 'Student Scholarships', address: 'Duhat, Tatalon, Q.C.' },
  { name: 'Ely Banoy', phone: '09216182094', sectorGroup: 'Student Scholarships', address: 'Duhat, Tatalon, Q.C.' },
  { name: 'Dereck Moray', phone: '09216182095', sectorGroup: 'Student Scholarships', address: 'Duhat, Tatalon, Q.C.' },
  { name: 'Colene Ashley Carinan', phone: '09216182096', sectorGroup: 'Student Scholarships', address: '31 Alagao St., Victory Ave., Q.C.' },
  { name: 'Rhea Alluco', phone: '09553303626', sectorGroup: 'Student Scholarships', address: '40 A-B Saragosa St., Sto. Domingo' },
  { name: 'Xyruz Mark Kelly Vidar', phone: '09553303627', sectorGroup: 'Student Scholarships', address: '62 Agno Ext., Tatalon, Q.C.' },
  { name: 'Virgilio Vidar III', phone: '09553303628', sectorGroup: 'Student Scholarships', address: '62 Agno Ext., Tatalon, Q.C.' },
  { name: 'Nekeisha Sophia Mae B. Sabin', phone: '09088328775', sectorGroup: 'Student Scholarships', address: '66 Agno Ext., Tatalon, Q.C.' },
  { name: 'Hana Medrano', phone: '09297668224', sectorGroup: 'Student Scholarships', address: '119 Kaliraya St., Tatalon, Q.C.' },

  // ==========================================
  // 2. ELDERLY (Senior Citizens Assistance)
  // ==========================================
  { name: 'Crescencia Mariano', phone: '09537124674', sectorGroup: 'Elderly', address: '27 ROTC Hunters, Tatalon, Q.C.' },
  { name: 'Avelina Sedano', phone: '09953429095', sectorGroup: 'Elderly', address: '27 ROTC Hunters, Tatalon, Q.C.' },
  { name: 'Zenaida Panganiban', phone: '09664728613', sectorGroup: 'Elderly', address: '27 ROTC Hunters, Tatalon, Q.C.' },
  { name: 'Anna Lorraine Almazan', phone: '09186547682', sectorGroup: 'Elderly', address: '60 Elgasi, Tatalon, Q.C.' },
  { name: 'Remedios Gapuz', phone: '09521702098', sectorGroup: 'Elderly', address: '27 ROTC Hunters, Tatalon, Q.C.' },
  { name: 'Merlita Soyson', phone: '09169992740', sectorGroup: 'Elderly', address: 'C-10B ROTC Hunters, Tatalon, Q.C.' },
  { name: 'Lavinda Gadiana', phone: '09922088738', sectorGroup: 'Elderly', address: '27 ROTC Hunters, Tatalon, Q.C.' },
  { name: 'Ester Caores', phone: '09069581714', sectorGroup: 'Elderly', address: '27 ROTC Hunters, Tatalon, Q.C.' },
  { name: 'Felipe Parnas', phone: '09752305625', sectorGroup: 'Elderly', address: '27 ROTC Hunters, Tatalon, Q.C.' },
  { name: 'Dina Andaya', phone: '09851068694', sectorGroup: 'Elderly', address: '27 ROTC Hunters, Tatalon, Q.C.' },
  { name: 'Josephine Roque', phone: '09300780981', sectorGroup: 'Elderly', address: '24 ROTC Hunters, Tatalon, Q.C.' },
  { name: 'Anastacia Dueras', phone: '09196589794', sectorGroup: 'Elderly', address: 'Cluster 23, Tagupo St., Tatalon, Q.C.' },
  { name: 'Leonora Dela Rosa', phone: '09518590694', sectorGroup: 'Elderly', address: '100 ROTC Hunters, Tatalon, Q.C.' },
  { name: 'Carmen Madriaga', phone: '09176387343', sectorGroup: 'Elderly', address: '48 Kitanlad, Tatalon, Q.C.' },
  { name: 'Gloria Castillo', phone: '09933267483', sectorGroup: 'Elderly', address: '4 Luhod St., Tatalon, Q.C.' },
  { name: 'Virginia T. Cordero', phone: '09485780205', sectorGroup: 'Elderly', address: '25 ROTC Hunters, Tatalon, Q.C.' },
  { name: 'Aurora Tabuena', phone: '09770018747', sectorGroup: 'Elderly', address: '66 Agno Ext., Tatalon, Q.C.' },
  { name: 'Crispina Pundol', phone: '09958665432', sectorGroup: 'Elderly', address: 'C-20 Tagupo, Tatalon, Q.C.' },
  { name: 'Susan Uy Cu', phone: '8741782611', sectorGroup: 'Elderly', address: '#87-89 D. Tuazon St., SMED' },

  // ==========================================
  // 3. PDL (nakakolong) (Prisoners & Families)
  // ==========================================
  { name: 'Reynante R. Paler', phone: '09535526449', sectorGroup: 'PDL (nakakolong)', address: '119 Kaliraya St. C-12, Tatalon, Q.C.' },
  { name: 'Chinorin C. Hilbay', phone: '09186675749', sectorGroup: 'PDL (nakakolong)', address: '64B Agno Extension, Tatalon, Q.C.' },
  { name: 'Eduardo Mata', phone: '09466508852', sectorGroup: 'PDL (nakakolong)', address: '27 ROTC Hunters, Tatalon, Q.C.' },
  { name: 'Dominador R. Makron', phone: '09086414167', sectorGroup: 'PDL (nakakolong)', address: '27 BMA, Tatalon, Q.C.' },
  { name: 'Alipio M. Agaton', phone: '09273688099', sectorGroup: 'PDL (nakakolong)', address: '113 A San Isidro, Labrador' },
  { name: 'Vergilio Maglaque', phone: '09064588328', sectorGroup: 'PDL (nakakolong)', address: '27 ROTC Hunters Hilltop, Tatalon, Q.C.' },
  { name: 'Romualdo Cariño', phone: '09727203903', sectorGroup: 'PDL (nakakolong)', address: '27 ROTC Hunters Hilltop, Tatalon, Q.C.' },
  { name: 'Froilan Ballesteros', phone: '09227984520', sectorGroup: 'PDL (nakakolong)', address: 'CL 24 ROTC Hunters, Q.C.' },
  { name: 'Jose Jr. P. Hachac', phone: '09216660688', sectorGroup: 'PDL (nakakolong)', address: 'B-5 L-9 San Gabriel St., Villa España II' },
  { name: 'Ivan Calagos', phone: '09706771782', sectorGroup: 'PDL (nakakolong)', address: 'B-5 L-9 San Roque St., Villa España II' },

  // ==========================================
  // 4. DRUG REHABILITATION. (Reformation & Aid)
  // ==========================================
  { name: 'Frederico Rabang', phone: '09166244114', sectorGroup: 'Drug rehabilitation.', address: '27 ROTC Hunters, Tatalon, Q.C.' },
  { name: 'Roldan Cariño', phone: '09966588707', sectorGroup: 'Drug rehabilitation.', address: '27 ROTC Hunters, Tatalon, Q.C.' },
  { name: 'Michael D. Lepak', phone: '09165740406', sectorGroup: 'Drug rehabilitation.', address: '20 BMA, Tatalon, Q.C.' },
  { name: 'Jaspher Batancila', phone: '09106337520', sectorGroup: 'Drug rehabilitation.', address: '96B Tagupo St., Tatalon, Q.C.' },
  { name: 'Reynaldo Sevilla', phone: '09486978779', sectorGroup: 'Drug rehabilitation.', address: '23 ROTC Hunters, Tatalon, Q.C.' },
  { name: 'Jeric B. Regla', phone: '09494870055', sectorGroup: 'Drug rehabilitation.', address: 'B-5 L-8 San Gabriel St., Villa España II' },
  { name: 'Mark M. Diaz', phone: '09456822551', sectorGroup: 'Drug rehabilitation.', address: 'B-2 L-20 San Roque St., Villa España II' },
  { name: 'Gregol Noble', phone: '09664734924', sectorGroup: 'Drug rehabilitation.', address: '119-A Kaliraya, Tatalon, Q.C.' },
  { name: 'Rodolfo Desalesa', phone: '09128081265', sectorGroup: 'Drug rehabilitation.', address: '17 Cardiz St., Tatalon, Q.C.' },
  { name: 'Rhandell Jay Belo', phone: '09678498157', sectorGroup: 'Drug rehabilitation.', address: '17 Cardiz St., Tatalon, Q.C.' },

  // ==========================================
  // 5. MIGRANT (Trans-Regional & Migrant Workers)
  // ==========================================
  { name: 'Christopher Lagadas', phone: '09192081150', sectorGroup: 'Migrant', address: '958 R. Papa St., Sampaloc, Manila' },
  { name: 'Peter Correa', phone: '09918770374', sectorGroup: 'Migrant', address: '23 ROTC Hunters, Tatalon, Q.C.' },
  { name: 'Reynaldo Gallargan', phone: '09566948967', sectorGroup: 'Migrant', address: 'C-10 ROTC Hunters, Tatalon, Q.C.' },
  { name: 'Shan Mavis Bautista', phone: '09214133030', sectorGroup: 'Migrant', address: 'C-4 A-6 119 Kaliraya St., Tatalon, Q.C.' },
  { name: 'Jarl Alfante', phone: '09754480601', sectorGroup: 'Migrant', address: 'B-1 L-15 San Gabriel St., Villa España II' },
  { name: 'Nalreyn G. Aricpe', phone: '09276840501', sectorGroup: 'Migrant', address: 'B-4 Lot 4 San Gabriel St., Villa España II' },
  { name: 'Andrei Angelo Daton', phone: '09276840502', sectorGroup: 'Migrant', address: 'B-4 Lot 3 San Gabriel St., Villa España II' },
  { name: 'Charles G. Tagarda', phone: '09997987588', sectorGroup: 'Migrant', address: 'B-1 L-12 San Gabriel St., Villa España II' },
  { name: 'John Romel Kyle D. Samarano', phone: '09666928210', sectorGroup: 'Migrant', address: 'B-4 L-23 San Roque St., Villa España II' },
  { name: 'Nanne Johanes D. Encarnacion', phone: '09160426045', sectorGroup: 'Migrant', address: '#11 Lapu-Lapu Drive, Tatalon, Q.C.' },
  { name: 'Laluhoy L. Untal', phone: '09682047641', sectorGroup: 'Migrant', address: '171 Balingasa St., Balintawak, Q.C.' },
  { name: 'M. Dhuane Vigne L. Tan', phone: '09773416028', sectorGroup: 'Migrant', address: '75 Sibuyan St., Balyso Subd., Q.C.' },

  // ==========================================
  // 6. LGBTQ (Inclusive Community Ministry)
  // ==========================================
  { name: 'Kyza Allyanna Kim', phone: '09553303629', sectorGroup: 'LGBTQ', address: '62 Agno Ext., Tatalon, Q.C.' },
  { name: 'Kate Viado', phone: '09203701684', sectorGroup: 'LGBTQ', address: 'Leo Ave., Elga St., Tatalon, Q.C.' },
  { name: 'Denice Kim E. Manansala', phone: '09276104887', sectorGroup: 'LGBTQ', address: '27 ROTC Hunters Hilltop, Tatalon, Q.C.' },
  { name: 'Shiaramie T. Magno', phone: '09519275568', sectorGroup: 'LGBTQ', address: '66 Agno Ext., Tatalon, Q.C.' },
  { name: 'Rosevyn D. Villasana', phone: '09755324759', sectorGroup: 'LGBTQ', address: 'B-1 L-21 San Gabriel St., Villa España II' },
  { name: 'Mark Daniel O. Gacutan', phone: '09954698211', sectorGroup: 'LGBTQ', address: 'B-1 L-30 San Gabriel St., Villa España II' },
  { name: 'Justine King A. Ferriol', phone: '09770849279', sectorGroup: 'LGBTQ', address: 'B-7 L-2 San Jose St., Villa España II' },
  { name: 'Jhon Mark T. Aguirre', phone: '09759269447', sectorGroup: 'LGBTQ', address: 'B-1 L-14 San Gabriel St., Villa España II' },
  { name: 'Jhon Carlo T. Aguirre', phone: '09494227594', sectorGroup: 'LGBTQ', address: 'B-1 L-14 San Gabriel St., Villa España II' },
  { name: 'Charlyn G. Tagarda', phone: '09997987589', sectorGroup: 'LGBTQ', address: 'B-1 L-14 San Gabriel St., Villa España II' },
  { name: 'Mar Jetty Alida', phone: '09754820077', sectorGroup: 'LGBTQ', address: '13 Cabalata St., Tatalon, Q.C.' },
  { name: 'Karl Hirochi Maras', phone: '09918583440', sectorGroup: 'LGBTQ', address: '631 Quezon Ave., Q.C.' },

  // ==========================================
  // 7. URBAN POOR (Indigent Community & Livelihood)
  // ==========================================
  { name: 'Josephine Pamesa', phone: '09606801967', sectorGroup: 'Urban Poor', address: '119 Kaliraya St. L-12, Tatalon, Q.C.' },
  { name: 'Ma. Rea Calalang', phone: '09456100818', sectorGroup: 'Urban Poor', address: '94 Kaliraya St. L-12, Tatalon, Q.C.' },
  { name: 'Herbert R. Calalang', phone: '09192546660', sectorGroup: 'Urban Poor', address: '96 Kaliraya St., Tatalon, Q.C.' },
  { name: 'Robelyn M. Macallan', phone: '09631914353', sectorGroup: 'Urban Poor', address: '27 ROTC Hunters Hilltop, Tatalon, Q.C.' },
  { name: 'Marissa Bautista', phone: '09163857873', sectorGroup: 'Urban Poor', address: '27 ROTC Hunters Hilltop, Tatalon, Q.C.' },
  { name: 'Regina Grace E. Llameg', phone: '09458744138', sectorGroup: 'Urban Poor', address: '27 ROTC Hunters Hilltop, Tatalon, Q.C.' },
  { name: 'Maybelyn E. Mag-aso', phone: '09686370354', sectorGroup: 'Urban Poor', address: '27 ROTC Hunters Hilltop, Tatalon, Q.C.' },
  { name: 'Lady Capayas', phone: '09668951556', sectorGroup: 'Urban Poor', address: '27 ROTC Hunters Hilltop, Tatalon, Q.C.' },
  { name: 'Nita C. Enciso', phone: '09168697059', sectorGroup: 'Urban Poor', address: '27 ROTC Hunters Hilltop, Tatalon, Q.C.' },
  { name: 'Jackelyn Saligumba', phone: '09664401982', sectorGroup: 'Urban Poor', address: '27 ROTC Hunters Hilltop, Tatalon, Q.C.' },
  { name: 'Carmen Cariño', phone: '09658909968', sectorGroup: 'Urban Poor', address: '27 ROTC Hunters Hilltop, Tatalon, Q.C.' },
  { name: 'Veronica Catamio', phone: '09770183759', sectorGroup: 'Urban Poor', address: '27 ROTC Hunters Hilltop, Tatalon, Q.C.' },
  { name: 'Abegail Dema-ala', phone: '09276104880', sectorGroup: 'Urban Poor', address: '27 ROTC Hunters Hilltop, Tatalon, Q.C.' },
  { name: 'Rachel Cariño', phone: '09069581714', sectorGroup: 'Urban Poor', address: '27 ROTC Hunters Hilltop, Tatalon, Q.C.' },
  { name: 'Isabel Buganite', phone: '09396347018', sectorGroup: 'Urban Poor', address: '27 ROTC Hunters, Tatalon, Q.C.' },
  { name: 'Elanie Berzou', phone: '09566089215', sectorGroup: 'Urban Poor', address: '27 ROTC Hunters, Tatalon, Q.C.' },
  { name: 'Rowena Rabang', phone: '09338797504', sectorGroup: 'Urban Poor', address: '27 ROTC Hunters, Tatalon, Q.C.' },
  { name: 'Emily Añalucas', phone: '09773544891', sectorGroup: 'Urban Poor', address: '27 ROTC Hunters, Tatalon, Q.C.' },
  { name: 'Jerry Echavaria', phone: '09156640257', sectorGroup: 'Urban Poor', address: '27 ROTC Hunters, Tatalon, Q.C.' },
  { name: 'Elizabeth Diana', phone: '09456348776', sectorGroup: 'Urban Poor', address: '27 ROTC Hunters, Tatalon, Q.C.' },
  { name: 'Juvylen Abilong', phone: '09533361698', sectorGroup: 'Urban Poor', address: '27 ROTC Hunters, Tatalon, Q.C.' },
  { name: 'Ester Lictaoa', phone: '09364938550', sectorGroup: 'Urban Poor', address: '27 ROTC Hunters, Tatalon, Q.C.' },
  { name: 'Lourdes Cariño', phone: '09687901957', sectorGroup: 'Urban Poor', address: '27 ROTC Hunters, Tatalon, Q.C.' },
  { name: 'Sharaine Ann Ramos', phone: '09301127887', sectorGroup: 'Urban Poor', address: '27 ROTC Hunters, Tatalon, Q.C.' },
  { name: 'Jonalyn Ochida', phone: '09396357102', sectorGroup: 'Urban Poor', address: '27 ROTC Hunters, Tatalon, Q.C.' },
  { name: 'Margie Cariño', phone: '09560511978', sectorGroup: 'Urban Poor', address: '27 ROTC Hunters, Tatalon, Q.C.' },
  { name: 'Jasmine Villacruz', phone: '09933855463', sectorGroup: 'Urban Poor', address: '23 ROTC Hunters, Tatalon, Q.C.' },
  { name: 'Eduardo Sta. Ana', phone: '09447705471', sectorGroup: 'Urban Poor', address: '27 ROTC Hunters, Tatalon, Q.C.' },
  { name: 'Reynaldo Peñaflor', phone: '09447710547', sectorGroup: 'Urban Poor', address: 'Sta. Crista Villa Sparta 3, Tatalon' },
  { name: 'Emily Isip', phone: '09513448788', sectorGroup: 'Urban Poor', address: '27 ROTC Hunters, Tatalon, Q.C.' },
  { name: 'Loline P. Gregorio', phone: '09216182087', sectorGroup: 'Urban Poor', address: '38 Victory Ave., Tatalon, Q.C.' },
  { name: 'Dolores C. Contreras', phone: '09686000634', sectorGroup: 'Urban Poor', address: '38 Victory Ave., Tatalon, Q.C.' },
  { name: 'Alma R. Banzuelo', phone: '09267139537', sectorGroup: 'Urban Poor', address: '38 Victory Ave., Tatalon, Q.C.' },
  { name: 'Elina Gracia', phone: '09513488788', sectorGroup: 'Urban Poor', address: '38 Victory Ave., Tatalon, Q.C.' },
  { name: 'Veronica Manila Billones', phone: '09453881471', sectorGroup: 'Urban Poor', address: '27 ROTC Hunters, Tatalon' },
  { name: 'Marife Timala', phone: '09497105471', sectorGroup: 'Urban Poor', address: 'C-24 ROTC Hunters, Tatalon' },
  { name: 'Angel Ann Andaya', phone: '09400143719', sectorGroup: 'Urban Poor', address: '27 ROTC Hunters, Tatalon' },
  { name: 'Ivy Angeles', phone: '09463342774', sectorGroup: 'Urban Poor', address: '27 ROTC Hunters, Tatalon' },
  { name: 'Ma. Bernadette Baltazar', phone: '09161480023', sectorGroup: 'Urban Poor', address: 'C-4 A-6 119 Kaliraya St., Tatalon' },
  { name: 'Maricel Cariño', phone: '09455784847', sectorGroup: 'Urban Poor', address: '27 ROTC Hunters, Tatalon' },
  { name: 'Lora Aviles', phone: '09562873005', sectorGroup: 'Urban Poor', address: '27 ROTC Hunters, Tatalon' },
  { name: 'Cristy Enciso', phone: '09779354183', sectorGroup: 'Urban Poor', address: '27 ROTC Hunters, Tatalon' },
  { name: 'Dolores Fernando', phone: '09556082643', sectorGroup: 'Urban Poor', address: '24 ROTC Hunters, Tatalon' },
  { name: 'Shaira Ramos', phone: '09384412114', sectorGroup: 'Urban Poor', address: '27 ROTC Hunters, Tatalon' },
  { name: 'Jeizle Calima Mendoza', phone: '09269417850', sectorGroup: 'Urban Poor', address: '20 BMA, Tatalon' },
  { name: 'Juanikose Pauyon Fulgencio', phone: '09330659141', sectorGroup: 'Urban Poor', address: '18 BMA Ave., Tatalon' },
  { name: 'Eloisa Fulgencio', phone: '09475110294', sectorGroup: 'Urban Poor', address: '20 BMA Brgy., Tatalon' },
  { name: 'Emily Embele Avellana', phone: '09910714232', sectorGroup: 'Urban Poor', address: '24 BMA, Tatalon' },
  { name: 'Brenda Orio', phone: '09638621173', sectorGroup: 'Urban Poor', address: '29 Cardiz St., Tatalon' },
  { name: 'Josephine Llanita De Vera', phone: '09329421926', sectorGroup: 'Urban Poor', address: '33 Cardiz St., Tatalon' },
  { name: 'Rowena A. Remigio', phone: '09122934959', sectorGroup: 'Urban Poor', address: '18 BMA, Tatalon' },
  { name: 'Lorena Rivera', phone: '09282317269', sectorGroup: 'Urban Poor', address: '18 BMA, Tatalon' },
  { name: 'Lorena V. Cullera', phone: '09493790772', sectorGroup: 'Urban Poor', address: '18 BMA, Tatalon' },
  { name: 'Shirley G. Recto', phone: '09636821966', sectorGroup: 'Urban Poor', address: '20 BMA, Tatalon' },
  { name: 'Arrahyaneisa Navarro', phone: '09885373884', sectorGroup: 'Urban Poor', address: '20 BMA, Tatalon' },
  { name: 'Rosalie S. Paneda', phone: '09370409208', sectorGroup: 'Urban Poor', address: '37 BMA, Tatalon' },
  { name: 'Marie Q. Dela Cruz', phone: '09219141851', sectorGroup: 'Urban Poor', address: '37 BMA, Tatalon' },
  { name: 'Leizel David', phone: '09753241105', sectorGroup: 'Urban Poor', address: 'Cluster 23 Tagupo St., Tatalon, Q.C.' },
  { name: 'Wilma Melchor', phone: '09064588328', sectorGroup: 'Urban Poor', address: '89 Tagupo St., Tatalon, Q.C.' },
  { name: 'Rosalinda Bleu', phone: '09186675746', sectorGroup: 'Urban Poor', address: 'Cluster 23, Tagupo St., Tatalon, Q.C.' },
  { name: 'Felicidad Dizon', phone: '09365206028', sectorGroup: 'Urban Poor', address: '96D Tagupo St., Tatalon, Q.C.' },
  { name: 'Emma Gerodino', phone: '09457857397', sectorGroup: 'Urban Poor', address: 'Cluster 24 Tagupo, Tatalon, Q.C.' },
  { name: 'Eva Espinosa', phone: '09063202951', sectorGroup: 'Urban Poor', address: 'Cluster 23 Tagupo St., Tatalon, Q.C.' },
  { name: 'Virgilio E. Vidar Jr.', phone: '09264913163', sectorGroup: 'Urban Poor', address: '62 Agno Ext., Tatalon, Q.C.' },
  { name: 'Maricel Vidar', phone: '09155774620', sectorGroup: 'Urban Poor', address: '62 Agno Ext., Tatalon, Q.C.' },
  { name: 'Erlinda Ireno', phone: '09154590481', sectorGroup: 'Urban Poor', address: '11 Bicol Brigade, Tatalon, Q.C.' },
  { name: 'Cathy Odanio', phone: '09069213873', sectorGroup: 'Urban Poor', address: '71-C Agno Ext., Tatalon, Q.C.' },
  { name: 'Vilma Acuna', phone: '09392672186', sectorGroup: 'Urban Poor', address: '46 Hyacinth St., Roxas, Q.C.' },
  { name: 'Catalina Vargas', phone: '09156712801', sectorGroup: 'Urban Poor', address: 'Blk 8-Lot 23 Cabualah St., Tatalon, Q.C.' },
  { name: 'Carolina G. Canoy', phone: '09354726441', sectorGroup: 'Urban Poor', address: '66 Agno Ext., Tatalon, Q.C.' },
  { name: 'Brenda B. Biclar (Diman)', phone: '09701673437', sectorGroup: 'Urban Poor', address: '66 Agno Ext., Tatalon, Q.C.' },
  { name: 'Princess G. Canoy', phone: '09294788702', sectorGroup: 'Urban Poor', address: '66 Agno Ext., Tatalon, Q.C.' },
  { name: 'Reina R. Mercurio', phone: '09366041713', sectorGroup: 'Urban Poor', address: 'Agno Ext., Tatalon, Q.C.' },
  { name: 'Elmira Joy Bandul', phone: '09520370574', sectorGroup: 'Urban Poor', address: '20 Tagupo St., Tatalon, Q.C.' },
  { name: 'Juvelyn B. Sacapa', phone: '09604124979', sectorGroup: 'Urban Poor', address: '66 Kaliraya St., Tatalon, Q.C.' },
  { name: 'Evila P. Esarza', phone: '09062848055', sectorGroup: 'Urban Poor', address: '119 Kaliraya St., Tatalon, Q.C.' }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const sectorCodeMap = {
      'Elderly': 'ELD',
      'Student Scholarships': 'SCH',
      'Urban Poor': 'UP',
      'PDL (nakakolong)': 'PDL',
      'Migrant': 'MIG',
      'LGBTQ': 'LGBTQ',
      'Drug rehabilitation.': 'DRUG'
    };

    let updatedCount = 0;
    let insertedCount = 0;

    for (const b of parishBeneficiaries) {
      const existing = await mongoose.connection.collection('users').findOne({ name: b.name });
      const prefix = sectorCodeMap[b.sectorGroup] || 'BEN';
      const year = 2024;
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const sectorIdNumber = `${prefix}-${year}-${randomNum}`;

      if (existing) {
        // Update their sectorGroup and sectorIdNumber
        await mongoose.connection.collection('users').updateOne(
          { _id: existing._id },
          {
            $set: {
              sectorGroup: b.sectorGroup,
              sectorIdNumber: existing.sectorIdNumber || sectorIdNumber,
              department: b.address,
              phone: b.phone || existing.phone
            }
          }
        );
        updatedCount++;
        console.log(`Updated beneficiary: ${b.name} -> [${b.sectorGroup}]`);
      } else {
        const email = `bene_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}@relietlink.local`;
        await mongoose.connection.collection('users').insertOne({
          name: b.name,
          email: email,
          phone: b.phone,
          role: 'user',
          status: 'active',
          sectorGroup: b.sectorGroup,
          sectorIdNumber: sectorIdNumber,
          department: b.address,
          totalAidReceivedCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        insertedCount++;
        console.log(`Inserted beneficiary: ${b.name} -> [${b.sectorGroup}] (${sectorIdNumber})`);
      }
    }

    console.log(`\nDone! Inserted: ${insertedCount}, Updated: ${updatedCount}`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error seeding beneficiaries:', err);
    process.exit(1);
  }
}

seed();
