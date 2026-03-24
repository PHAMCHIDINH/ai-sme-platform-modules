import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

// ——— SINH VIÊN ———
const students = [
  {
    email: "nguyen.anh@student.hcmus.edu.vn",
    name: "Nguyễn Minh Anh",
    university: "Đại học Khoa học Tự nhiên TP.HCM",
    major: "Kỹ thuật Phần mềm",
    skills: ["Fullstack Web", "API Design", "UI/UX"],
    technologies: ["React", "Next.js", "TypeScript", "PostgreSQL", "TailwindCSS"],
    interests: ["E-commerce", "SaaS", "EdTech"],
    availability: "20h/tuần",
    description: "Sinh viên năm 4 đam mê xây dựng sản phẩm web. Đã làm 2 dự án freelance.",
    githubUrl: "https://github.com/nguyen-minh-anh",
  },
  {
    email: "tran.duc@student.hust.edu.vn",
    name: "Trần Đức Huy",
    university: "Đại học Bách Khoa Hà Nội",
    major: "Khoa học Máy tính",
    skills: ["Back-end", "Data Engineering", "DevOps"],
    technologies: ["Python", "Django", "FastAPI", "Docker", "PostgreSQL"],
    interests: ["FinTech", "Healthcare IT", "Data Platform"],
    availability: "15h/tuần",
    description: "Thành thạo Python backend và hạ tầng Docker. Tìm kiếm dự án scale thực tế.",
    githubUrl: "https://github.com/tran-duc-huy",
  },
  {
    email: "le.bich@student.dit.edu.vn",
    name: "Lê Bích Ngọc",
    university: "Đại học RMIT Việt Nam",
    major: "Thiết kế Đa phương tiện & Công nghệ",
    skills: ["UI/UX Design", "Front-end", "Motion Design"],
    technologies: ["Figma", "React", "Framer", "CSS Animation"],
    interests: ["E-commerce", "Healthtech", "Social App"],
    availability: "10h/tuần",
    description: "Chuyên thiết kế giao diện người dùng đẹp, kết hợp front-end implement.",
    portfolioUrl: "https://lebichngoc.dev",
  },
  {
    email: "pham.khoa@student.uet.vnu.vn",
    name: "Phạm Trung Khoa",
    university: "Đại học Công nghệ - Đại học Quốc gia Hà Nội",
    major: "Hệ thống Thông tin",
    skills: ["Data Analysis", "Machine Learning", "Business Intelligence"],
    technologies: ["Python", "Pandas", "Scikit-learn", "Power BI", "SQL"],
    interests: ["Retail Analytics", "HR Tech", "Supply Chain"],
    availability: "20h/tuần",
    description: "Mạnh về phân tích dữ liệu, xây dashboard báo cáo và tích hợp ML nhẹ nhàng.",
    githubUrl: "https://github.com/ptkhoa",
  },
  {
    email: "hoang.linh@student.htu.edu.vn",
    name: "Hoàng Thuỳ Linh",
    university: "Đại học Thăng Long",
    major: "Quản trị Hệ thống Mạng",
    skills: ["Cybersecurity", "Network Admin", "Cloud Infrastructure"],
    technologies: ["Linux", "AWS", "Terraform", "Nginx", "Wireshark"],
    interests: ["Cloud", "Cybersecurity", "Infrastructure"],
    availability: "12h/tuần",
    description: "Có kinh nghiệm triển khai hạ tầng cloud AWS, tìm dự án thực chiến.",
    githubUrl: "https://github.com/hoang-thuy-linh",
  },
  {
    email: "do.nam@student.huflit.edu.vn",
    name: "Đỗ Quốc Nam",
    university: "Đại học Ngoại ngữ - Tin học TP.HCM",
    major: "Công nghệ thông tin",
    skills: ["Mobile App", "Back-end", "REST API"],
    technologies: ["Flutter", "Dart", "Node.js", "Firebase", "MongoDB"],
    interests: ["App Di động", "O2O", "Local Business"],
    availability: "25h/tuần",
    description: "Chuyên làm app đa nền tảng Flutter, đã publish 1 app cá nhân lên store.",
    githubUrl: "https://github.com/donam-dev",
  },
  {
    email: "nguyen.tri@student.uel.edu.vn",
    name: "Nguyễn Tấn Trí",
    university: "Đại học Kinh tế - Luật TP.HCM",
    major: "Hệ thống thông tin quản lý",
    skills: ["ERP", "Business Process", "Low-code"],
    technologies: ["Odoo", "Make.com", "Google AppScript", "Airtable", "Excel VBA"],
    interests: ["ERP/CRM", "Quy trình số hóa", "SME Tools"],
    availability: "15h/tuần",
    description: "Chuyên tư vấn và cài đặt giải pháp low-code / no-code cho SME.",
    githubUrl: "https://github.com/nguyen-tri-dev",
  },
  {
    email: "ly.thuong@student.tdtu.edu.vn",
    name: "Lý Thuỵ Thường",
    university: "Đại học Tôn Đức Thắng",
    major: "Kỹ thuật phần mềm",
    skills: ["AI/ML", "NLP", "Back-end"],
    technologies: ["Python", "HuggingFace", "LangChain", "FastAPI", "Pinecone"],
    interests: ["AI Agent", "Chatbot", "EdTech"],
    availability: "20h/tuần",
    description: "Đang nghiên cứu AI/NLP, tìm cơ hội áp dụng LLM vào sản phẩm thực.",
    githubUrl: "https://github.com/ly-thuy-thuong",
  },
  {
    email: "bui.khanh@student.fptu.edu.vn",
    name: "Bùi Nhật Khánh",
    university: "FPT University",
    major: "Software Engineering",
    skills: ["Game Dev", "Front-end", "3D Design"],
    technologies: ["Unity", "C#", "Three.js", "Blender", "React"],
    interests: ["Gamification", "EdTech", "Interactive Media"],
    availability: "18h/tuần",
    description: "Làm game indie, có thể tích hợp gamification vào ứng dụng web/mobile.",
    portfolioUrl: "https://buinhatkanh.itch.io",
  },
  {
    email: "vu.lan@student.vanlanguni.vn",
    name: "Vũ Lan Anh",
    university: "Đại học Văn Lang",
    major: "Công nghệ thông tin",
    skills: ["E-commerce Dev", "SEO & Marketing Tech", "Web Design"],
    technologies: ["WordPress", "Shopify", "PHP", "MySQL", "Google Ads Script"],
    interests: ["E-commerce", "Digital Marketing", "Retail"],
    availability: "15h/tuần",
    description: "Thành thạo xây website thương mại điện tử và tối ưu hóa chuyển đổi.",
    githubUrl: "https://github.com/vulananh-dev",
  },
];

// ——— DOANH NGHIỆP SME ———
const smes = [
  {
    email: "contact@phongkhamthienhuong.com",
    name: "Dr. Nguyễn Thiên Hương",
    companyName: "Phòng khám Thiên Hương",
    industry: "Y tế & Sức khỏe",
    companySize: "10-50",
    description: "Phòng khám đa khoa tư nhân tại TP.HCM, hỗ trợ khám nội khoa, da liễu, tim mạch.",
  },
  {
    email: "admin@cafebaristaclub.vn",
    name: "Trần Bảo Long",
    companyName: "Café Barista Club",
    industry: "F&B / Ẩm thực",
    companySize: "10-50",
    description: "Chuỗi 5 cửa hàng cà phê specialty tại Hà Nội, đang mở rộng thương hiệu online.",
  },
  {
    email: "ceo@techfarm.vn",
    name: "Lê Quang Hải",
    companyName: "TechFarm Việt Nam",
    industry: "Nông nghiệp Công nghệ",
    companySize: "50-200",
    description: "Startup nông nghiệp thông minh, cung cấp giải pháp IoT giám sát trang trại.",
  },
  {
    email: "hello@dulichsaigontrip.vn",
    name: "Phạm Thuỳ Dung",
    companyName: "Saigon Trip Travel",
    industry: "Du lịch & Lữ hành",
    companySize: "10-50",
    description: "Công ty lữ hành chuyên tour nội địa Việt Nam và incoming từ Đông Nam Á.",
  },
  {
    email: "info@xwfashion.net",
    name: "Nguyễn Hồng Vân",
    companyName: "XW Fashion",
    industry: "Thời trang & Bán lẻ",
    companySize: "10-50",
    description: "Thương hiệu thời trang nữ trẻ trung, bán online qua Shopee, TikTok Shop, Web riêng.",
  },
  {
    email: "cto@logibiztech.io",
    name: "Đặng Kỳ Tuấn",
    companyName: "LogiBiz Technology",
    industry: "Logistics & Vận tải",
    companySize: "50-200",
    description: "Công ty phần mềm quản lý vận chuyển, hỗ trợ các công ty logistics vừa.",
  },
  {
    email: "director@edustarschool.edu.vn",
    name: "Trần Thanh Hoa",
    companyName: "EduStar Language School",
    industry: "Giáo dục & Đào tạo",
    companySize: "10-50",
    description: "Trung tâm Anh ngữ cho trẻ em và học sinh cấp 2, có 3 cơ sở tại Đà Nẵng.",
  },
  {
    email: "contact@greencleanvn.com",
    name: "Lê Ngọc Sơn",
    companyName: "GreenClean Services",
    industry: "Dịch vụ Vệ sinh - Môi trường",
    companySize: "10-50",
    description: "Dịch vụ vệ sinh văn phòng và chung cư tại Hà Nội, đang số hóa quy trình.",
  },
  {
    email: "hr@medifoodvn.com",
    name: "Nguyễn Hoàng Nam",
    companyName: "Medifood Việt Nam",
    industry: "Thực phẩm chức năng",
    companySize: "10-50",
    description: "Công ty thực phẩm chức năng nhập khẩu và phân phối tại kênh online & chuỗi nhà thuốc.",
  },
  {
    email: "ceo@homenestinterior.vn",
    name: "Bùi Quỳnh Nga",
    companyName: "HomeNest Interior",
    industry: "Nội thất & Trang trí",
    companySize: "10-50",
    description: "Công ty thiết kế nội thất cho căn hộ và văn phòng tại TP.HCM.",
  },
];

// ——— DỰ ÁN (20 projects – 2 cho mỗi SME) ———
const projectDataBySmeName = (smeIdx: number): { title: string; description: string; expectedOutput: string; requiredSkills: string[]; difficulty: "EASY" | "MEDIUM" | "HARD"; duration: string; budget: string; }[] => {
  const all: Record<number, any[]> = {
    0: [ // Phòng khám Thiên Hương
      {
        title: "Chatbot tư vấn FAQ cho phòng khám",
        description: "Chúng tôi bị khách hỏi đi hỏi lại các câu như 'Phòng khám mở cửa mấy giờ?', 'Bác sĩ da liễu lịch khám thứ mấy?'. Nhân viên reply rất mệt. Cần 1 chatbot Facebook Messenger hoặc Zalo OA tự trả lời.",
        expectedOutput: "Chatbot tích hợp Zalo OA hoặc FB Messenger, kết nối knowledge base từ Google Sheet",
        requiredSkills: ["Chatbot", "API Integration", "Python"],
        difficulty: "MEDIUM",
        duration: "3 tuần",
        budget: "3.000.000 VNĐ + giấy khen",
      },
      {
        title: "Hệ thống đặt lịch khám online",
        description: "Hiện tại khách phải gọi điện hoặc nhắn Zalo để đặt lịch khám, dễ nhầm lẫn và bỏ sót. Chúng tôi cần một hệ thống đặt lịch đơn giản qua web.",
        expectedOutput: "Website đặt lịch hẹn, kết nối Google Calendar của bác sĩ, gửi nhắc lịch qua Zalo",
        requiredSkills: ["Web Development", "Google Calendar API", "Zalo API"],
        difficulty: "MEDIUM",
        duration: "4 tuần",
        budget: "5.000.000 VNĐ",
      },
    ],
    1: [ // Café Barista Club
      {
        title: "App mobile order nội bộ cho nhân viên",
        description: "Khi có sự kiện đặt tiệc lớn, nhân viên phải viết order tay rất bất tiện. Cần app đơn giản để ghi order từng bàn, đẩy vào bếp và tính tiền nhanh.",
        expectedOutput: "App Flutter đa nền tảng iOS/Android cho phép ghi order theo bàn và in bill",
        requiredSkills: ["Flutter", "Firebase", "UI/UX"],
        difficulty: "MEDIUM",
        duration: "4 tuần",
        budget: "2 tháng internship thực tế",
      },
      {
        title: "Dashboard doanh thu chuỗi 5 cửa hàng",
        description: "Mỗi tháng phải tổng hợp doanh thu 5 quán từ file Excel riêng lẻ, rất mất thời gian. Cần dashboard tự động tổng hợp và hiển thị theo ngày, tháng, cửa hàng.",
        expectedOutput: "Dashboard web kết nối Google Sheet hoặc Notion, hiển thị biểu đồ doanh thu, lịch sử theo chuỗi",
        requiredSkills: ["Data Visualization", "Google Sheets API", "Web Front-end"],
        difficulty: "EASY",
        duration: "2 tuần",
        budget: "1.500.000 VNĐ + review Google",
      },
    ],
    2: [ // TechFarm
      {
        title: "Dashboard giám sát cảm biến trang trại IoT",
        description: "Chúng tôi có sensor đo nhiệt độ, độ ẩm, ánh sáng trong nhà kính nhưng không có giao diện xem dữ liệu tập trung. Cần dashboard real-time hiển thị từ MQTT.",
        expectedOutput: "Web app đọc dữ liệu MQTT, hiển thị các biểu đồ real-time và cảnh báo vượt ngưỡng qua email/SMS",
        requiredSkills: ["IoT", "MQTT", "React", "Chart.js"],
        difficulty: "HARD",
        duration: "6 tuần",
        budget: "8.000.000 VNĐ",
      },
      {
        title: "App nhật ký canh tác trên điện thoại",
        description: "Nông dân muốn ghi lại các hoạt động canh tác hàng ngày (tưới nước, phun thuốc) từ điện thoại và xem lại lịch sử. Cần app đơn giản, dùng được offline.",
        expectedOutput: "App Flutter offline-first, đồng bộ lên cloud khi có internet, báo cáo nhật ký theo giai đoạn",
        requiredSkills: ["Flutter", "SQLite", "Offline First"],
        difficulty: "MEDIUM",
        duration: "5 tuần",
        budget: "4.000.000 VNĐ",
      },
    ],
    3: [ // Saigon Trip
      {
        title: "Website đặt tour du lịch mới",
        description: "Website hiện tại của chúng tôi làm trên WordPress cũ, tải chậm, không đặt lịch được. Cần redesign và có chức năng đặt tour online, thanh toán sau.",
        expectedOutput: "Website Next.js mới với trang listing tour, trang chi tiết, form đặt chỗ và gửi email xác nhận",
        requiredSkills: ["Web Development", "Next.js", "Email API"],
        difficulty: "MEDIUM",
        duration: "5 tuần",
        budget: "6.000.000 VNĐ",
      },
      {
        title: "Tool tự động tổng hợp đánh giá từ Google Maps và TripAdvisor",
        description: "Chúng tôi muốn theo dõi đánh giá từ khách mỗi ngày nhưng phải vào từng platform xem. Cần tool tổng hợp đánh giá tự động gửi báo cáo tuần qua email.",
        expectedOutput: "Script Python scrape Google Maps và TripAdvisor, tổng hợp sentiment, gửi mail tóm tắt hàng tuần",
        requiredSkills: ["Web Scraping", "Python", "NLP cơ bản", "Email automation"],
        difficulty: "MEDIUM",
        duration: "2 tuần",
        budget: "2.000.000 VNĐ",
      },
    ],
    4: [ // XW Fashion
      {
        title: "Tích hợp quản lý đơn hàng từ Shopee & TikTok Shop về 1 dashboard",
        description: "Bán ở 3-4 kênh cùng lúc, phải vào từng trang quản lý rất mất công. Cần dashboard tổng hợp đơn từ Shopee, TikTok Shop và web về một chỗ.",
        expectedOutput: "Tool Python/Node tích hợp API Shopee và TikTok Shop, bảng dashboard tổng hợp đơn hàng real-time",
        requiredSkills: ["API Integration", "Shopee API", "TikTok Shop API", "Node.js"],
        difficulty: "HARD",
        duration: "6 tuần",
        budget: "7.000.000 VNĐ + hoa hồng nếu tốt",
      },
      {
        title: "Chatbot tư vấn phối đồ tự động qua Zalo",
        description: "Khách hỏi 'áo này mặc với quần nào?', 'mình mập có mặc được không?' rất nhiều. Cần chatbot Zalo OA tư vấn phối đồ và recommend sản phẩm.",
        expectedOutput: "Chatbot Zalo OA tích hợp catalog sản phẩm, tư vấn phối đồ bằng AI gọi LLM, dẫn link mua hàng",
        requiredSkills: ["Chatbot", "Zalo API", "LLM API", "Python"],
        difficulty: "HARD",
        duration: "5 tuần",
        budget: "5.000.000 VNĐ",
      },
    ],
    5: [ // LogiBiz
      {
        title: "Tính năng tra cứu hành trình đơn vận chuyển theo realtime",
        description: "Khách hàng của chúng tôi phải gọi điện trực tiếp để hỏi hàng đến đâu. Cần cổng tra cứu đơn giản cho phép nhập mã đơn và xem lộ trình.",
        expectedOutput: "Web app nhỏ + API REST cho phép tra cứu trạng thái vận đơn, hiển thị timeline lộ trình",
        requiredSkills: ["Web Development", "REST API", "Back-end"],
        difficulty: "MEDIUM",
        duration: "3 tuần",
        budget: "3.500.000 VNĐ",
      },
      {
        title: "Tự động hóa báo cáo vận đơn hàng tháng qua Excel",
        description: "Cuối tháng nhân viên phải mất 2 ngày để tổng hợp báo cáo vận đơn từ hệ thống. Cần script tự động generate file báo cáo và gửi email.",
        expectedOutput: "Script Python tự động pull dữ liệu từ DB, xuất Excel báo cáo có biểu đồ, gửi mail tự động",
        requiredSkills: ["Python", "OpenPyXL", "SQL", "Email automation"],
        difficulty: "EASY",
        duration: "2 tuần",
        budget: "2.000.000 VNĐ",
      },
    ],
    6: [ // EduStar
      {
        title: "Hệ thống quản lý học viên và điểm danh",
        description: "Trung tâm quản lý lớp học và điểm danh bằng bảng giấy, hay thất lạc dữ liệu. Cần phần mềm web đơn giản cho giáo viên và quản lý.",
        expectedOutput: "Ứng dụng web quản lý lớp, học viên, điểm danh có QR Code, xuất báo cáo sĩ số",
        requiredSkills: ["Web Development", "QR Code", "Back-end"],
        difficulty: "MEDIUM",
        duration: "4 tuần",
        budget: "4.000.000 VNĐ",
      },
      {
        title: "App luyện từ vựng tiếng Anh theo bài học",
        description: "Chúng tôi muốn học sinh tự luyện từ vựng từ bài học ở nhà. Cần app flashcard flashcard đơn giản, đồng bộ danh sách từ từ giáo viên nhập.",
        expectedOutput: "Mobile app hoặc web app flashcard từ vựng, spaced repetition, liên kết Google Sheet",
        requiredSkills: ["React hoặc Flutter", "Spaced Repetition", "Google Sheets API"],
        difficulty: "EASY",
        duration: "3 tuần",
        budget: "2.500.000 VNĐ",
      },
    ],
    7: [ // GreenClean
      {
        title: "App nhân viên nhận và xác nhận lịch vệ sinh",
        description: "Hiện tại lịch phân công cho nhân viên vệ sinh bằng điện thoại, dễ sai. Cần app để nhân viên xem lịch làm việc và xác nhận đã hoàn thành.",
        expectedOutput: "App Flutter cho nhân viên xem lịch công việc, check-in/check-out với GPS, ghi chú phòng",
        requiredSkills: ["Flutter", "GPS", "Firebase"],
        difficulty: "MEDIUM",
        duration: "4 tuần",
        budget: "3.500.000 VNĐ",
      },
      {
        title: "Website booking dịch vụ vệ sinh online",
        description: "Khách phải gọi điện để đặt lịch, nhiều khi bỏ lỡ. Cần website cho khách đặt lịch và chọn loại dịch vụ, thanh toán online.",
        expectedOutput: "Website với form đặt lịch, chọn gói dịch vụ, thanh toán qua VNPay, nhân viên nhận thông báo",
        requiredSkills: ["Web Development", "VNPay API", "Email/SMS"],
        difficulty: "MEDIUM",
        duration: "4 tuần",
        budget: "5.000.000 VNĐ",
      },
    ],
    8: [ // Medifood
      {
        title: "Phần mềm quản lý kho và nhập xuất sản phẩm",
        description: "Công ty nhập nhiều loại thực phẩm chức năng, quản lý kho bằng Excel rất dễ sai số. Cần phần mềm web theo dõi tồn kho theo lô và hạn sử dụng.",
        expectedOutput: "Web app quản lý kho: nhập/xuất, tồn, cảnh báo gần hết hạn, báo cáo kiểm kê",
        requiredSkills: ["Web Development", "Back-end", "Database Design"],
        difficulty: "MEDIUM",
        duration: "5 tuần",
        budget: "5.000.000 VNĐ",
      },
      {
        title: "Công cụ so sánh và tra cứu sản phẩm cho nhân viên bán hàng",
        description: "Nhân viên tư vấn cần tra nhanh thành phần, tác dụng và chỉ định của từng sản phẩm để tư vấn đúng cho khách. Cần tool nội bộ tra cứu nhanh.",
        expectedOutput: "Web app tra cứu sản phẩm theo từ khóa, so sánh 2-3 sản phẩm cùng lúc, export PDF",
        requiredSkills: ["Web Front-end", "Search Algorithm", "PDF Export"],
        difficulty: "EASY",
        duration: "2 tuần",
        budget: "2.000.000 VNĐ",
      },
    ],
    9: [ // HomeNest
      {
        title: "Website portfolio thiết kế nội thất có 3D preview",
        description: "Website hiện tại chỉ để hình ảnh tĩnh, khách không thấy ấn tượng. Cần website mới với gallery đẹp, có thể xem 3D hoặc video tour ảo.",
        expectedOutput: "Website portfolio Next.js với gallery dự án, tích hợp model 3D nhúng bằng Three.js hoặc Sketchfab",
        requiredSkills: ["Next.js", "Three.js hoặc Sketchfab API", "UI/UX"],
        difficulty: "MEDIUM",
        duration: "3 tuần",
        budget: "4.000.000 VNĐ",
      },
      {
        title: "Tool tự động bóc tách bảng vật liệu từ file CAD/thiết kế",
        description: "Mỗi dự án phải tay bóc tách danh sách vật tư từ bản vẽ, rất mất thời gian và hay sai. Cần tool hỗ trợ xuất danh sách vật liệu từ file thiết kế.",
        expectedOutput: "Script Python hoặc tool web đọc file DXF/Excel thiết kế, xuất danh mục vật liệu tự động",
        requiredSkills: ["Python", "DXF Parser", "Automation"],
        difficulty: "HARD",
        duration: "6 tuần",
        budget: "6.000.000 VNĐ",
      },
    ],
  };
  return all[smeIdx] || [];
};

type SeededStudent = {
  userId: string;
  profileId: string;
  name: string;
  email: string;
};

type SeededProject = {
  id: string;
  title: string;
  smeUserId: string;
};

const EMBEDDING_DIMENSIONS = 8;

function deterministicEmbedding(seed: string, dimensions = EMBEDDING_DIMENSIONS) {
  return Array.from({ length: dimensions }, (_, index) => {
    let hash = 0;
    const saltedSeed = `${seed}:${index}`;
    for (let i = 0; i < saltedSeed.length; i++) {
      hash = (hash * 31 + saltedSeed.charCodeAt(i)) % 10007;
    }
    const normalized = (hash / 10007) * 2 - 1;
    return Number(normalized.toFixed(6));
  });
}

async function main() {
  console.log("🌱 Bắt đầu seed dữ liệu mẫu...");
  const password = await hash("password123", 10);
  const seededStudents: SeededStudent[] = [];
  const seededProjects: SeededProject[] = [];

  // Xoá dữ liệu cũ theo thứ tự để tránh FK conflict
  await prisma.evaluation.deleteMany();
  await prisma.projectProgress.deleteMany();
  await prisma.application.deleteMany();
  await prisma.project.deleteMany();
  await prisma.sMEProfile.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log("🗑️  Đã xoá dữ liệu cũ");

  // Tạo sinh viên
  console.log("👩‍🎓 Tạo sinh viên...");
  for (const s of students) {
    const user = await prisma.user.create({
      data: {
        email: s.email,
        password,
        name: s.name,
        role: "STUDENT",
        studentProfile: {
          create: {
            university: s.university,
            major: s.major,
            skills: s.skills,
            technologies: s.technologies,
            interests: s.interests,
            availability: s.availability,
            description: s.description,
            githubUrl: s.githubUrl,
            portfolioUrl: (s as any).portfolioUrl,
            embedding: deterministicEmbedding(
              `student:${s.email}:${s.skills.join(",")}:${s.technologies.join(",")}`,
            ),
          },
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        studentProfile: {
          select: {
            id: true,
          },
        },
      },
    });
    if (!user.studentProfile) {
      throw new Error(`Không thể tạo StudentProfile cho ${s.email}`);
    }
    seededStudents.push({
      userId: user.id,
      profileId: user.studentProfile.id,
      name: user.name,
      email: user.email,
    });
    console.log(`  ✔ Sinh viên: ${s.name} (${s.email})`);
  }

  // Tạo SME và Projects
  console.log("🏢 Tạo doanh nghiệp và dự án...");
  for (let i = 0; i < smes.length; i++) {
    const s = smes[i];
    const smeUser = await prisma.user.create({
      data: {
        email: s.email,
        password,
        name: s.name,
        role: "SME",
        smeProfile: {
          create: {
            companyName: s.companyName,
            industry: s.industry,
            companySize: s.companySize,
            description: s.description,
          },
        },
      },
      include: { smeProfile: true },
    });

    const smeProfile = smeUser.smeProfile!;
    const projects = projectDataBySmeName(i);

    for (const p of projects) {
      const project = await prisma.project.create({
        data: {
          smeId: smeProfile.id,
          title: p.title,
          description: p.description,
          expectedOutput: p.expectedOutput,
          requiredSkills: p.requiredSkills,
          difficulty: p.difficulty,
          duration: p.duration,
          budget: p.budget,
          status: "OPEN",
          embedding: deterministicEmbedding(
            `project:${s.companyName}:${p.title}:${p.requiredSkills.join(",")}`,
          ),
        },
        select: {
          id: true,
          title: true,
        },
      });
      seededProjects.push({
        id: project.id,
        title: project.title,
        smeUserId: smeUser.id,
      });
    }
    console.log(`  ✔ SME: ${s.companyName} – ${projects.length} dự án`);
  }

  console.log("🔁 Tạo dữ liệu luồng E2E mẫu...");
  const [studentA, studentB, studentC] = seededStudents;
  const [completedProject, inProgressProject, submittedProject] = seededProjects;

  if (!studentA || !studentB || !studentC || !completedProject || !inProgressProject || !submittedProject) {
    throw new Error("Không đủ dữ liệu seed để tạo luồng E2E mẫu.");
  }

  const oneDayMs = 24 * 60 * 60 * 1000;
  const now = Date.now();

  await prisma.$transaction(async (tx) => {
    await tx.application.createMany({
      data: [
        {
          projectId: completedProject.id,
          studentId: studentA.profileId,
          status: "ACCEPTED",
          matchScore: 92,
        },
        {
          projectId: completedProject.id,
          studentId: studentB.profileId,
          status: "REJECTED",
          matchScore: 71,
        },
      ],
    });

    await tx.projectProgress.create({
      data: {
        projectId: completedProject.id,
        studentId: studentA.profileId,
        status: "COMPLETED",
        milestones: [
          {
            id: "ms-completed-1",
            title: "Kickoff và thống nhất yêu cầu",
            createdAt: new Date(now - 12 * oneDayMs).toISOString(),
          },
          {
            id: "ms-completed-2",
            title: "Hoàn tất bản MVP",
            createdAt: new Date(now - 8 * oneDayMs).toISOString(),
          },
        ],
        updates: [
          {
            id: "upd-completed-1",
            content: "Đã hoàn thành UI và tích hợp API chính.",
            createdAt: new Date(now - 7 * oneDayMs).toISOString(),
          },
          {
            id: "upd-completed-2",
            content: "Đã fix bug và bàn giao tài liệu triển khai.",
            createdAt: new Date(now - 4 * oneDayMs).toISOString(),
          },
        ],
        deliverableUrl: "https://example.com/deliverables/completed-project",
        deadline: new Date(now - 2 * oneDayMs),
      },
    });

    await tx.project.update({
      where: { id: completedProject.id },
      data: { status: "COMPLETED" },
    });

    await tx.evaluation.create({
      data: {
        projectId: completedProject.id,
        evaluatorId: completedProject.smeUserId,
        evaluateeId: studentA.userId,
        type: "SME_TO_STUDENT",
        outputQuality: 5,
        onTime: 5,
        proactiveness: 4,
        communication: 5,
        overallFit: 5,
        comment: "Sinh viên chủ động và bàn giao đầy đủ.",
      },
    });

    await tx.evaluation.create({
      data: {
        projectId: completedProject.id,
        evaluatorId: studentA.userId,
        evaluateeId: completedProject.smeUserId,
        type: "STUDENT_TO_SME",
        outputQuality: 5,
        onTime: 4,
        proactiveness: 5,
        communication: 5,
        overallFit: 5,
        comment: "Doanh nghiệp hỗ trợ nhanh, yêu cầu rõ ràng.",
      },
    });

    await tx.application.createMany({
      data: [
        {
          projectId: inProgressProject.id,
          studentId: studentB.profileId,
          status: "ACCEPTED",
          matchScore: 88,
        },
        {
          projectId: inProgressProject.id,
          studentId: studentC.profileId,
          status: "PENDING",
          matchScore: 73,
        },
      ],
    });

    await tx.projectProgress.create({
      data: {
        projectId: inProgressProject.id,
        studentId: studentB.profileId,
        status: "IN_PROGRESS",
        milestones: [
          {
            id: "ms-progress-1",
            title: "Đã hoàn tất phân tích yêu cầu",
            createdAt: new Date(now - 3 * oneDayMs).toISOString(),
          },
        ],
        updates: [
          {
            id: "upd-progress-1",
            content: "Đã dựng xong skeleton dự án và module auth.",
            createdAt: new Date(now - 2 * oneDayMs).toISOString(),
          },
        ],
        deadline: new Date(now + 10 * oneDayMs),
      },
    });

    await tx.project.update({
      where: { id: inProgressProject.id },
      data: { status: "IN_PROGRESS" },
    });

    await tx.application.createMany({
      data: [
        {
          projectId: submittedProject.id,
          studentId: studentC.profileId,
          status: "ACCEPTED",
          matchScore: 90,
        },
        {
          projectId: submittedProject.id,
          studentId: studentA.profileId,
          status: "REJECTED",
          matchScore: 69,
        },
      ],
    });

    await tx.projectProgress.create({
      data: {
        projectId: submittedProject.id,
        studentId: studentC.profileId,
        status: "SUBMITTED",
        milestones: [
          {
            id: "ms-submitted-1",
            title: "Hoàn tất chức năng chính",
            createdAt: new Date(now - 5 * oneDayMs).toISOString(),
          },
        ],
        updates: [
          {
            id: "upd-submitted-1",
            content: "Đã submit bản bàn giao, chờ SME nghiệm thu.",
            createdAt: new Date(now - 1 * oneDayMs).toISOString(),
          },
        ],
        deliverableUrl: "https://example.com/deliverables/submitted-project",
        deadline: new Date(now + 5 * oneDayMs),
      },
    });

    await tx.project.update({
      where: { id: submittedProject.id },
      data: { status: "SUBMITTED" },
    });
  });

  const [statusSummary, projectsWithEmbedding, studentsWithEmbedding] = await Promise.all([
    prisma.project.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.project.count({
      where: {
        NOT: { embedding: { equals: [] } },
      },
    }),
    prisma.studentProfile.count({
      where: {
        NOT: { embedding: { equals: [] } },
      },
    }),
  ]);

  console.log("\n🎉 Seed hoàn tất!");
  console.log("📋 Tóm tắt:");
  console.log(`   • ${students.length} Sinh viên`);
  console.log(`   • ${smes.length} Doanh nghiệp SME`);
  console.log(`   • ${seededProjects.length} Dự án`);
  console.log(
    `   • Trạng thái dự án: ${statusSummary.map((item) => `${item.status}: ${item._count._all}`).join(", ")}`,
  );
  console.log(`   • Embedding: ${projectsWithEmbedding} dự án, ${studentsWithEmbedding} sinh viên`);
  console.log("\n🔑 Mật khẩu mặc định: password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
