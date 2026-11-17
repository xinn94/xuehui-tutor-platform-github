export const initialTutors = [
  { id:'t1', name:'林沐晴', avatar:'晴', color:'peach', education:'國立清華大學 數學系', subjects:['數學','微積分'], levels:['國中','高中','大學'], philosophy:'先理解，再熟練。', style:'循序漸進、重視觀念', mode:'線上／實體', location:'新竹市', intro:'喜歡把抽象的數學概念拆解成容易理解的小步驟，陪學生找到自己的解題節奏。', experience:'3 年教學經驗', publicName:true },
  { id:'t2', name:'陳以安', avatar:'安', color:'mint', education:'國立臺灣大學 外文系', subjects:['英文','國文'], levels:['國小','國中','高中'], philosophy:'讓語言成為表達自己的工具。', style:'互動練習、生活情境', mode:'線上', location:'不限地區', intro:'擅長從日常素材帶入語言學習，重視學生開口表達與建立信心。', experience:'2 年教學經驗', publicName:true },
  { id:'t3', name:'周子謙', avatar:'謙', color:'yellow', education:'國立成功大學 物理系', subjects:['物理','數學','理化'], levels:['國中','高中'], philosophy:'把每個為什麼都當成探索的起點。', style:'圖像理解、問題引導', mode:'線上／實體', location:'台南市', intro:'會搭配圖像與生活例子建立觀念，再逐步練習題目與應用。', experience:'4 年教學經驗', publicName:true },
  { id:'t4', name:'許若彤', avatar:'彤', color:'lavender', education:'國立政治大學 經濟學系', subjects:['經濟學','統計學','數學'], levels:['高中','大學','社會人士'], philosophy:'學習不是背下答案，而是看懂脈絡。', style:'案例討論、觀念整理', mode:'線上', location:'不限地區', intro:'適合需要整理經濟與統計觀念的學生，也能依照學習目標調整進度。', experience:'2 年教學經驗', publicName:true }
];

export const initialRequests = [
  { id:'r1', owner:'s1', displayName:'小宇', level:'高中', subjects:['數學'], mode:'線上／實體', location:'新竹市', need:'希望加強數學觀念，尤其是函數與三角函數，也想建立比較穩定的讀書節奏。', status:'招募中', updated:'今天', privateInfo:{ school:'新竹市某高中', contact:'demo.student@example.com' } },
  { id:'r2', owner:'s2', displayName:'想學英文的上班族', level:'社會人士', subjects:['英文'], mode:'線上', location:'不限地區', need:'希望加強日常會話與工作場合的英文表達，期待課程能配合平日晚上。', status:'招募中', updated:'昨天', privateInfo:{ school:'', contact:'learner@example.com' } },
  { id:'r3', owner:'s3', displayName:'小晴的家長', level:'國小', subjects:['英文','國語'], mode:'實體', location:'台中市', need:'希望找一位有耐心的老師，陪孩子建立閱讀習慣與基礎能力。', status:'招募中', updated:'11/15', privateInfo:{ school:'台中市某國小', contact:'parent@example.com' } }
];

export const subjectOptions = ['國文','國語','英文','數學','理化','物理','化學','自然','微積分','線性代數','統計學','經濟學','程式設計','語言學習','專業技能'];
export const levelOptions = ['國小','國中','高中','大學','社會人士'];
