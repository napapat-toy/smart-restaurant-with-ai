export const mockMenuItems = [
  // --- เมนูราดข้าว ---
  {
    name: "ข้าวกะเพราหมูสับไข่ดาวกรอบ",
    description: "ข้าวกะเพราหมูสับรสแซ่บจัดจ้าน ผัดแห้งๆ หอมกลิ่นกะเพราป่า เสิร์ฟคู่กับไข่ดาวขอบกรอบไข่แดงเยิ้ม",
    price: 65,
    image: "https://images.unsplash.com/photo-1626804475297-4160aaeaba1c?auto=format&fit=crop&w=600&q=80",
    category: "เมนูราดข้าว",
    isAvailable: true,
    options: [
      {
        name: "ระดับความเผ็ด",
        required: true,
        allowMultiple: false,
        choices: [
          { name: "ไม่เผ็ดเลย", priceDelta: 0 },
          { name: "เผ็ดน้อย", priceDelta: 0 },
          { name: "เผ็ดปกติ (พริก 3 เม็ด)", priceDelta: 0 },
          { name: "เผ็ดจัดจ้าน (พริกขี้หนูสวน)", priceDelta: 0 }
        ]
      },
      {
        name: "ตัวเลือกเพิ่มเติม",
        required: false,
        allowMultiple: true,
        choices: [
          { name: "เพิ่มไข่ดาวกรอบ", priceDelta: 10 },
          { name: "เพิ่มไข่เจียวต้นหอม", priceDelta: 15 },
          { name: "เพิ่มหมูสับพิเศษ (+Double)", priceDelta: 25 },
          { name: "เปลี่ยนเป็นข้าวไรซ์เบอร์รี่", priceDelta: 10 }
        ]
      },
      {
        name: "ตัวเลือกเพื่อสุขภาพ",
        required: false,
        allowMultiple: true,
        choices: [
          { name: "ไม่ใส่ผงชูรส (No MSG)", priceDelta: 0 },
          { name: "ลดเค็ม (Low Sodium)", priceDelta: 0 },
          { name: "ผัดน้ำ (ไม่ใช้น้ำมัน)", priceDelta: 0 },
          { name: "ใช้น้ำมันมะกอกเพื่อสุขภาพ", priceDelta: 15 }
        ]
      }
    ]
  },
  {
    name: "ข้าวกะเพราหมูกรอบไข่ดาว",
    description: "หมูกรอบชิ้นโตหนังฟูกรอบสะท้านใจ ผัดพริกกระเทียมซอสกะเพราสูตรโบราณ รสเข้มข้นจัดจ้าน",
    price: 75,
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80",
    category: "เมนูราดข้าว",
    isAvailable: true,
    options: [
      {
        name: "ระดับความเผ็ด",
        required: true,
        allowMultiple: false,
        choices: [
          { name: "เผ็ดน้อย", priceDelta: 0 },
          { name: "เผ็ดปกติ", priceDelta: 0 },
          { name: "เผ็ดพ่นไฟ", priceDelta: 0 }
        ]
      },
      {
        name: "ตัวเลือกเพิ่มเติม",
        required: false,
        allowMultiple: true,
        choices: [
          { name: "เพิ่มไข่ดาวกรอบ", priceDelta: 10 },
          { name: "เพิ่มหมูกรอบพิเศษ", priceDelta: 30 }
        ]
      }
    ]
  },
  {
    name: "ข้าวผัดคะน้าหมูกรอบ",
    description: "คะน้าฮ่องกงยอดอ่อนหวานกรอบคัดพิเศษ ผัดไฟแดงแรงๆ คลุกเคล้าหมูกรอบ รสชาติกลมกล่อมนัวๆ",
    price: 70,
    image: "https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&w=600&q=80",
    category: "เมนูราดข้าว",
    isAvailable: true,
    options: [
      {
        name: "ท็อปปิ้งไข่ดาว",
        required: false,
        allowMultiple: false,
        choices: [
          { name: "เพิ่มไข่ดาวกรอบ", priceDelta: 10 },
          { name: "เพิ่มไข่เค็มผ่าซีก", priceDelta: 12 }
        ]
      }
    ]
  },
  {
    name: "ข้าวหมูทอดกระเทียมพริกไทย",
    description: "หมูชิ้นหมักซอสสูตรเด็ดทอดจนเหลืองทอง คลุกเคล้ากระเทียมเจียวกรอบหอมฟุ้ง พริกไทยเข้มข้นสะใจ",
    price: 60,
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
    category: "เมนูราดข้าว",
    isAvailable: true,
    options: [
      {
        name: "ท็อปปิ้งเพิ่มเติม",
        required: false,
        allowMultiple: true,
        choices: [
          { name: "เพิ่มไข่ดาวกรอบ", priceDelta: 10 },
          { name: "เพิ่มหมูทอดพิเศษ", priceDelta: 20 }
        ]
      }
    ]
  },
  {
    name: "ข้าวผัดพริกแกงหมูชิ้นหน่อไม้ดอง",
    description: "พริกแกงเข้มข้นรสร้อนแรงถึงใจ ผัดใส่หน่อไม้ดองเปรี้ยวเค็มอร่อยลงตัวและหมูชิ้นนุ่มๆ",
    price: 65,
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80",
    category: "เมนูราดข้าว",
    isAvailable: true,
    options: [
      {
        name: "ความเผ็ดพริกแกง",
        required: true,
        allowMultiple: false,
        choices: [
          { name: "เผ็ดน้อย", priceDelta: 0 },
          { name: "เผ็ดปกติ", priceDelta: 0 },
          { name: "เผ็ดจัดจ้านสไตล์ใต้", priceDelta: 5 }
        ]
      }
    ]
  },
  {
    name: "ข้าวไข่ข้นซอสต้มยำกุ้งสด",
    description: "ไข่ข้นเนื้อเนียนนุ่มเยิ้มละมุนลิ้น ราดด้วยซอสต้มยำเข้มข้นสะใจและกุ้งขาวสดเนื้อเด้งดึ๋ง",
    price: 85,
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80",
    category: "เมนูราดข้าว",
    isAvailable: true,
    options: [
      {
        name: "จำนวนกุ้งพิเศษ",
        required: false,
        allowMultiple: false,
        choices: [
          { name: "กุ้งดับเบิ้ล (+ กุ้งสด 3 ตัว)", priceDelta: 30 }
        ]
      }
    ]
  },
  {
    name: "ข้าวผัดปูสูตรเมืองทอง",
    description: "ข้าวหอมมะลิเรียงเม็ดสวยผัดไฟแรงหอมกลิ่นกระทะโชย คลุกเนื้อปูก้อนหวานๆ ต้นหอม และไข่เป็ดสุดนัว",
    price: 85,
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80",
    category: "เมนูราดข้าว",
    isAvailable: true,
    options: [
      {
        name: "ท็อปปิ้งเนื้อปู",
        required: false,
        allowMultiple: false,
        choices: [
          { name: "เพิ่มเนื้อปูพิเศษ", priceDelta: 40 }
        ]
      }
    ]
  },
  {
    name: "ข้าวไข่เจียวหมูสับฟูกรอบ",
    description: "ไข่เจียวหมูสับฟูหนาขอบกรอบฟูเหลืองอร่ามแห้งไม่อมน้ำมัน ทานร้อนๆ คู่กับซอสพริกศรีราชาเด็ดดวง",
    price: 50,
    image: "https://images.unsplash.com/photo-1626847037657-fd3622613ce3?auto=format&fit=crop&w=600&q=80",
    category: "เมนูราดข้าว",
    isAvailable: true,
    options: [
      {
        name: "ท็อปปิ้งเสริมไข่เจียว",
        required: false,
        allowMultiple: true,
        choices: [
          { name: "ใส่ชะอม", priceDelta: 5 },
          { name: "ใส่ต้นหอมพริกสด", priceDelta: 0 },
          { name: "เพิ่มปูอัดฉีก", priceDelta: 10 }
        ]
      }
    ]
  },

  // --- เมนูเส้น ---
  {
    name: "ผัดซีอิ๊วเส้นใหญ่หมูนุ่ม",
    description: "เส้นใหญ่คั่วไฟแรงจนหอมกลิ่นกระทะไหม้นิดๆ เคลือบซีอิ๊วดำหวาน ผักคะน้ากรอบ และหมูหมักนุ่มๆ",
    price: 65,
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80",
    category: "เมนูเส้น",
    isAvailable: true,
    options: [
      {
        name: "ตัวเลือกเส้น",
        required: true,
        allowMultiple: false,
        choices: [
          { name: "เส้นใหญ่เหนียวนุ่ม", priceDelta: 0 },
          { name: "เส้นหมี่ขาว", priceDelta: 0 },
          { name: "บะหมี่กึ่งสำเร็จรูป", priceDelta: 5 }
        ]
      }
    ]
  },
  {
    name: "ผัดไทยกุ้งสดเส้นจันท์",
    description: "เส้นจันท์เหนียวนุ่มผัดซอสมะขามเปียกสูตรดั้งเดิม รสเปรี้ยวอมหวานกลมกล่อม ใส่กุ้งสดเต้าหู้และถั่วลิสงคั่วเอง",
    price: 85,
    image: "https://images.unsplash.com/photo-1626804475315-9944d183061a?auto=format&fit=crop&w=600&q=80",
    category: "เมนูเส้น",
    isAvailable: true,
    options: [
      {
        name: "ถั่วลิสงและพริกป่น",
        required: true,
        allowMultiple: false,
        choices: [
          { name: "ใส่ครบถั่ว+พริก", priceDelta: 0 },
          { name: "ไม่ใส่ถั่วลิสง", priceDelta: 0 },
          { name: "ไม่ใส่พริกป่น", priceDelta: 0 },
          { name: "ไม่ใส่ทั้งคู่", priceDelta: 0 }
        ]
      }
    ]
  },
  {
    name: "ราดหน้าเส้นใหญ่ยอดผักหมูหมัก",
    description: "เส้นใหญ่นุ่มคั่วหอม ราดซอสยอดผักสูตรกวางตุ้งข้นละมุนลิ้น หมูหมักชิ้นใหญ่รสกลมกล่อม",
    price: 65,
    image: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=600&q=80",
    category: "เมนูเส้น",
    isAvailable: true,
    options: [
      {
        name: "ตัวเลือกเพิ่ม",
        required: false,
        allowMultiple: false,
        choices: [
          { name: "ใส่ไข่ในน้ำราดหน้า", priceDelta: 10 }
        ]
      }
    ]
  },
  {
    name: "มาม่าผัดขี้เมาทะเลใต้เดือด",
    description: "บะหมี่ผัดขี้เมาแห้งรสจัดจ้านร้อนแรง สมุนไพรสดครบเครื่องพริกไทยอ่อน กุ้งและปลาหมึกชิ้นโต",
    price: 75,
    image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=600&q=80",
    category: "เมนูเส้น",
    isAvailable: true,
    options: [
      {
        name: "ระดับความเผ็ดร้อน",
        required: true,
        allowMultiple: false,
        choices: [
          { name: "เผ็ดน้อย", priceDelta: 0 },
          { name: "เผ็ดร้อนปกติ", priceDelta: 0 },
          { name: "เผ็ดเหงื่อซึม (ขี้เมาแท้)", priceDelta: 0 }
        ]
      }
    ]
  },

  // --- เมนูกับข้าว ---
  {
    name: "ต้มยำกุ้งแม่น้ำมะพร้าวอ่อนน้ำข้น",
    description: "กุ้งแม่น้ำมันเยิ้มๆ ต้มยำน้ำซุปสมุนไพรเข้มข้นมันอร่อย ใส่เนื้อมะพร้าวอ่อนเคี้ยวกรุบหวานมัน",
    price: 180,
    image: "https://images.unsplash.com/photo-1548943487-a2e4e43b4859?auto=format&fit=crop&w=600&q=80",
    category: "เมนูกับข้าว",
    isAvailable: true,
    options: [
      {
        name: "ขนาดบรรจุเสิร์ฟ",
        required: true,
        allowMultiple: false,
        choices: [
          { name: "ใส่ชามปกติ", priceDelta: 0 },
          { name: "ใส่หม้อไฟร้อนเดือด (+ กุ้งเพิ่ม)", priceDelta: 80 }
        ]
      }
    ]
  },
  {
    name: "แกงจืดเต้าหู้หมูสับสาหร่าย",
    description: "น้ำซุปใสกระดูกหมูหอมหวานร้อนกรุ่น คล่องคอสุดๆ อัดเต้าหู้หลอดเนื้อนุ่ม หมูสับก้อนบิ๊กเบิ้ม และสาหร่ายชั้นดี",
    price: 90,
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80",
    category: "เมนูกับข้าว",
    isAvailable: true,
    options: []
  },
  {
    name: "ผัดผักบุ้งไฟแดงเต้าเจี้ยวพริกสด",
    description: "ผักบุ้งจีนคัดยอดใบอ่อน ผัดกระทะร้อนพ่นไฟแดงควันโขมง เค็มเต้าเจี้ยว เผ็ดซี้ดด้วยพริกขี้หนูทุบ",
    price: 75,
    image: "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?auto=format&fit=crop&w=600&q=80",
    category: "เมนูกับข้าว",
    isAvailable: true,
    options: [
      {
        name: "ตัวเลือกเพิ่มเติม",
        required: false,
        allowMultiple: false,
        choices: [
          { name: "เพิ่มหมูกรอบคลุกซอส", priceDelta: 35 }
        ]
      }
    ]
  },
  {
    name: "หมูกรอบทอดซอสน้ำปลาหอม",
    description: "หมูกรอบชิ้นหนาผิวนอกกรอบหนังฟู เนื้อในนุ่มฉ่ำ ราดซอสน้ำปลาเคี่ยวหวานเค็มเคี้ยวเพลิน เคียงพริกน้ำปลาทำสด",
    price: 120,
    image: "https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=600&q=80",
    category: "เมนูกับข้าว",
    isAvailable: true,
    options: []
  },
  {
    name: "ต้มยำโป๊ะแตกทะเลระเบิด",
    description: "ต้มยำน้ำใสรสสมุนไพรร้อนแรง เผ็ดจัดจ้าน อุดมไปด้วย กุ้ง ปลาหมึก หอยแมลงภู่นิวซีแลนด์ และใบกะเพราป่าหอมฟุ้ง",
    price: 160,
    image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80",
    category: "เมนูกับข้าว",
    isAvailable: true,
    options: []
  },

  // --- ของทานเล่น ---
  {
    name: "ลูกชิ้นปลาหมึกชุบแป้งทอดกรอบ",
    description: "ลูกชิ้นปลาหมึกเกรดส่งออก นำมาทอดจนเนื้อเด้งพองเหลืองกรอบฟู เสิร์ฟคู่กับน้ำจิ้มมะขามรสหวานอมเปรี้ยวเผ็ด",
    price: 55,
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80",
    category: "ของทานเล่น",
    isAvailable: true,
    options: []
  },
  {
    name: "เกี๊ยวซ่าหมูเด้งทอดกรอบสไตล์ไทย",
    description: "เกี๊ยวบางกรอบห่อไส้หมูเด้งปรุงรสกลมกล่อม ทอดแห้งไม่อมน้ำมัน ทานร้อนๆ คู่น้ำจิ้มบ๊วยเจี่ยรสหวานหอม",
    price: 50,
    image: "https://images.unsplash.com/photo-1541696490-8744a5db0228?auto=format&fit=crop&w=600&q=80",
    category: "ของทานเล่น",
    isAvailable: true,
    options: []
  },

  // --- เครื่องดื่ม ---
  {
    name: "ชาไทยเย็นสูตรนมสดเข้มข้น",
    description: "ชาไทยโบราณคัดยอดชาต้มจนหอมกรุ่น ชงเข้มข้นหวานมันสะใจ ท็อปปิ้งด้วยนมสดแท้แทรกมิติรสสัมผัสหอมละมุน",
    price: 40,
    image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80",
    category: "เครื่องดื่ม",
    isAvailable: true,
    options: [
      {
        name: "ระดับความหวาน",
        required: true,
        allowMultiple: false,
        choices: [
          { name: "ไม่หวานเลย (0% - เพื่อสุขภาพ)", priceDelta: 0 },
          { name: "หวานน้อยมาก (25%)", priceDelta: 0 },
          { name: "หวานน้อยกลมกล่อม (50%)", priceDelta: 0 },
          { name: "หวานระดับมาตรฐาน (100%)", priceDelta: 0 }
        ]
      },
      {
        name: "ท็อปปิ้งเครื่องดื่ม",
        required: false,
        allowMultiple: true,
        choices: [
          { name: "เฉาก๊วยหนึบเหนียว", priceDelta: 10 },
          { name: "วิปครีมนมหอมมัน", priceDelta: 15 },
          { name: "บุกคริสตัลเจลลี่", priceDelta: 10 }
        ]
      }
    ]
  },
  {
    name: "โอเลี้ยงโบราณราดยกล้อ",
    description: "กาแฟโอเลี้ยงดำเข้มต้มหอมๆ ราดนมสดคาร์เนชันฉ่ำเยิ้มท่วมแก้ว เย็นฉ่ำคลายร้อนสไตล์ย้อนยุค",
    price: 35,
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80",
    category: "เครื่องดื่ม",
    isAvailable: true,
    options: [
      {
        name: "ระดับความหวาน",
        required: true,
        allowMultiple: false,
        choices: [
          { name: "ไม่หวานเลย (0% - เพื่อสุขภาพ)", priceDelta: 0 },
          { name: "หวานปกติ (100%)", priceDelta: 0 }
        ]
      },
      {
        name: "ระดับความเข้มกาแฟ",
        required: true,
        allowMultiple: false,
        choices: [
          { name: "กาแฟข้นระดับปกติ", priceDelta: 0 },
          { name: "กาแฟเข้มข้นขมคอ (+50%)", priceDelta: 0 }
        ]
      }
    ]
  },
  {
    name: "น้ำเก๊กฮวยต้มใบเตยเย็นชื่นใจ",
    description: "ดอกเก๊กฮวยแห้งเกรดเอต้มผสมใบเตยหอม หวานกำลังดี ช่วยดับกระหาย คลายร้อน ชื่นใจสุดๆ",
    price: 30,
    image: "https://images.unsplash.com/photo-1497515114629-f71d768fd07c?auto=format&fit=crop&w=600&q=80",
    category: "เครื่องดื่ม",
    isAvailable: true,
    options: [
      {
        name: "ระดับความหวาน",
        required: true,
        allowMultiple: false,
        choices: [
          { name: "ไม่หวานเลย (0% - เพื่อสุขภาพ)", priceDelta: 0 },
          { name: "หวานน้อย (50%)", priceDelta: 0 },
          { name: "หวานปกติ (100%)", priceDelta: 0 }
        ]
      }
    ]
  }
];

export const mockTables = [
  { tableNumber: "1", status: "Available" as const, token: "tok_t1_xyz" },
  { tableNumber: "2", status: "Occupied" as const, token: "tok_t2_xyz" },
  { tableNumber: "3", status: "Available" as const, token: "tok_t3_xyz" },
  { tableNumber: "4", status: "Available" as const, token: "tok_t4_xyz" },
  { tableNumber: "5", status: "Occupied" as const, token: "tok_t5_xyz" },
  { tableNumber: "6", status: "Available" as const, token: "tok_t6_xyz" },
  { tableNumber: "7", status: "Available" as const, token: "tok_t7_xyz" },
  { tableNumber: "8", status: "Occupied" as const, token: "tok_t8_xyz" },
  { tableNumber: "9", status: "Available" as const, token: "tok_t9_xyz" },
  { tableNumber: "10", status: "Available" as const, token: "tok_t10_xyz" },
];

export const mockCategories = [
  { name: "เมนูราดข้าว", order: 1 },
  { name: "เมนูเส้น", order: 2 },
  { name: "เมนูกับข้าว", order: 3 },
  { name: "ของทานเล่น", order: 4 },
  { name: "เครื่องดื่ม", order: 5 },
];
