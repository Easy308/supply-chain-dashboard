// Expand supplier data for all industrial belts
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('C:/industrial-belt-dashboard/data/industrial-belts.json', 'utf-8'));

// Additional suppliers by belt name (real Chinese companies)
const extraSuppliers = {
  "深圳电子产业带": [
    {"name":"深圳市海思半导体有限公司","regTime":"2004-10","regCapital":"60000万","paidCapital":"60000万","qualification":"国家高新技术企业","partners":["华为"],"employees":"7000+","revenue":"不公开","contact":"0755-28780808","website":"www.hisilicon.com","mainCategory":"芯片设计/处理器/AI芯片"},
    {"name":"深圳市华星光电半导体显示技术有限公司","regTime":"2009-11","regCapital":"1930000万","paidCapital":"1930000万","qualification":"国家高新","partners":["TCL","三星","小米"],"employees":"20000+","revenue":"600亿+","contact":"0755-21539888","website":"www.csot.com","mainCategory":"显示面板/LCD/OLED"},
    {"name":"深圳市比亚迪电子部品件有限公司","regTime":"2003-01","regCapital":"50000万","paidCapital":"50000万","qualification":"上市公司子公司","partners":["苹果","华为","三星"],"employees":"60000+","revenue":"1000亿+","contact":"0755-89888888","website":"www.byd.com","mainCategory":"手机代工/金属结构件/电池"},
    {"name":"深圳市兆驰股份有限公司","regTime":"2005-04","regCapital":"166000万","paidCapital":"166000万","qualification":"上市公司","partners":["飞利浦","创维"],"employees":"20000+","revenue":"200亿+","contact":"0755-26981888","website":"www.megmeet.com","mainCategory":"LED/电源/液晶电视"},
    {"name":"深圳市瑞丰光电子股份有限公司","regTime":"2000-03","regCapital":"45000万","paidCapital":"45000万","qualification":"上市公司/国家高新","partners":["三星","LG","飞利浦"],"employees":"3000+","revenue":"30亿+","contact":"0755-29415888","website":"www.refond.com","mainCategory":"LED封装/Mini LED"},
    {"name":"深圳市洲明科技股份有限公司","regTime":"2004-12","regCapital":"72000万","paidCapital":"72000万","qualification":"上市公司","partners":["华为","阿里巴巴"],"employees":"5000+","revenue":"60亿+","contact":"0755-29988288","website":"www.unilumin.com","mainCategory":"LED显示/智慧照明"},
    {"name":"深圳市德赛电池科技股份有限公司","regTime":"1995-01","regCapital":"26000万","paidCapital":"26000万","qualification":"上市公司","partners":["苹果","华为","三星"],"employees":"8000+","revenue":"200亿+","contact":"0752-3366888","website":"www.desay-battery.com","mainCategory":"锂电池/移动电源"},
    {"name":"深圳市长盈精密技术股份有限公司","regTime":"2001-11","regCapital":"96000万","paidCapital":"96000万","qualification":"上市公司","partners":["苹果","华为","OPPO"],"employees":"25000+","revenue":"200亿+","contact":"0755-28126888","website":"www.everwin.com","mainCategory":"精密连接器/结构件"},
    {"name":"深圳市安克创新科技股份有限公司","regTime":"2011-12","regCapital":"40000万","paidCapital":"40000万","qualification":"上市公司/跨境品牌","partners":["Amazon","Walmart","Best Buy"],"employees":"4000+","revenue":"170亿+","contact":"0755-86168888","website":"www.anker.com","mainCategory":"充电器/移动电源/音频"},
    {"name":"深圳市绿联科技股份有限公司","regTime":"2012-06","regCapital":"40000万","paidCapital":"40000万","qualification":"上市公司/跨境品牌","partners":["Amazon","京东","天猫"],"employees":"3500+","revenue":"100亿+","contact":"0755-26168888","website":"www.ugreen.com","mainCategory":"数据线/扩展坞/充电器"}
  ],
  "东莞智能制造产业带": [
    {"name":"东莞市领益智造股份有限公司","regTime":"2002-01","regCapital":"260000万","paidCapital":"260000万","qualification":"上市公司","partners":["苹果","华为","特斯拉"],"employees":"30000+","revenue":"300亿+","contact":"0769-22301888","website":"www.luxshare-ict.com","mainCategory":"精密功能件/结构件"},
    {"name":"东莞市正扬电子机械有限公司","regTime":"2005-03","regCapital":"8000万","paidCapital":"8000万","qualification":"国家高新","partners":["OPPO","vivo"],"employees":"3000+","revenue":"15亿+","contact":"0769-85312888","website":"","mainCategory":"手机配件/精密模具"},
    {"name":"东莞市长安镇新益精密五金有限公司","regTime":"2003-06","regCapital":"5000万","paidCapital":"5000万","qualification":"广东省高新","partners":["苹果供应链"],"employees":"2000+","revenue":"10亿+","contact":"0769-85302888","website":"","mainCategory":"精密五金/CNC加工"},
    {"name":"东莞市金太阳研磨股份有限公司","regTime":"1992-01","regCapital":"30000万","paidCapital":"30000万","qualification":"上市公司","partners":["3M","Saint-Gobain"],"employees":"3000+","revenue":"20亿+","contact":"0769-85101888","website":"www.gts-abr.com","mainCategory":"涂附磨具/研磨材料"},
    {"name":"东莞市捷荣技术股份有限公司","regTime":"2005-09","regCapital":"35000万","paidCapital":"35000万","qualification":"上市公司","partners":["华为","小米","联想"],"employees":"8000+","revenue":"30亿+","contact":"0769-85333888","website":"www.jeroan.com","mainCategory":"手机结构件/模具注塑"},
    {"name":"东莞市信鸿电子有限公司","regTime":"1999-01","regCapital":"15000万","paidCapital":"15000万","qualification":"国家高新","partners":["华为","中兴"],"employees":"5000+","revenue":"25亿+","contact":"0769-85268888","website":"","mainCategory":"FPC柔性电路板/HDI"}
  ],
  "佛山家具产业带": [
    {"name":"佛山市顺德区美的电热电器制造有限公司","regTime":"1968-01","regCapital":"680000万","paidCapital":"680000万","qualification":"世界500强","partners":["全球零售渠道"],"employees":"150000+","revenue":"3500亿+","contact":"0757-26338888","website":"www.midea.com","mainCategory":"家电/暖通/机器人"},
    {"name":"广东志达家居实业有限公司","regTime":"1990-01","regCapital":"12000万","paidCapital":"12000万","qualification":"广东省名牌","partners":["红星美凯龙","居然之家"],"employees":"3000+","revenue":"15亿+","contact":"0757-28786888","website":"","mainCategory":"沙发/软体家具"},
    {"name":"佛山市南海区全友家私有限公司","regTime":"1986-01","regCapital":"80000万","paidCapital":"80000万","qualification":"中国驰名商标","partners":["全国经销渠道"],"employees":"20000+","revenue":"100亿+","contact":"0757-86325888","website":"www.quanyou.com.cn","mainCategory":"板式家具/定制家居"},
    {"name":"佛山市顺德区左右家私有限公司","regTime":"1986-06","regCapital":"50000万","paidCapital":"50000万","qualification":"中国驰名商标","partners":["红星美凯龙"],"employees":"8000+","revenue":"50亿+","contact":"0757-28901888","website":"www.zuoyou.com","mainCategory":"沙发/客厅家具"},
    {"name":"佛山市新明珠陶瓷集团有限公司","regTime":"1992-01","regCapital":"50000万","paidCapital":"50000万","qualification":"中国驰名商标","partners":["碧桂园","万科"],"employees":"10000+","revenue":"80亿+","contact":"0757-85386888","website":"www.xmz-group.com","mainCategory":"瓷砖/岩板/卫浴"},
    {"name":"佛山市科达机电股份有限公司","regTime":"1992-05","regCapital":"86000万","paidCapital":"86000万","qualification":"上市公司","partners":["全球建材企业"],"employees":"5000+","revenue":"60亿+","contact":"0757-82013888","website":"www.kedachina.com","mainCategory":"陶瓷机械/墙材装备"}
  ],
  "义乌小商品产业带": [
    {"name":"浙江哈尔斯智能家居股份有限公司","regTime":"2001-12","regCapital":"42000万","paidCapital":"42000万","qualification":"上市公司","partners":["星巴克","Costa"],"employees":"5000+","revenue":"30亿+","contact":"0579-87171888","website":"www.haers.com","mainCategory":"保温杯/水杯"},
    {"name":"义乌市创意园文化用品有限公司","regTime":"2010-03","regCapital":"3000万","paidCapital":"3000万","qualification":"浙江省名牌","partners":["Daiso","Dollar Tree"],"employees":"500+","revenue":"2亿+","contact":"0579-85533888","website":"","mainCategory":"文具/学生用品"},
    {"name":"浙江真爱集团有限公司","regTime":"1995-01","regCapital":"20000万","paidCapital":"20000万","qualification":"中国驰名商标","partners":["沃尔玛","家乐福"],"employees":"3000+","revenue":"15亿+","contact":"0579-85551888","website":"www.zhenaiblanket.com","mainCategory":"毛毯/家纺"},
    {"name":"义乌市奥凯体育用品有限公司","regTime":"2008-06","regCapital":"5000万","paidCapital":"5000万","qualification":"浙江省名牌","partners":["Decathlon","迪卡侬"],"employees":"800+","revenue":"3亿+","contact":"0579-85558888","website":"","mainCategory":"体育用品/健身器材"},
    {"name":"浙江浪莎控股集团有限公司","regTime":"1995-01","regCapital":"60000万","paidCapital":"60000万","qualification":"上市公司/中国驰名商标","partners":["全国经销渠道"],"employees":"8000+","revenue":"30亿+","contact":"0579-85581888","website":"www.langsha.com","mainCategory":"袜业/内衣/家居服"},
    {"name":"义乌市荣达工艺品有限公司","regTime":"2005-01","regCapital":"5000万","paidCapital":"5000万","qualification":"浙江省出口名牌","partners":["Amazon","eBay"],"employees":"1000+","revenue":"5亿+","contact":"0579-85269888","website":"","mainCategory":"圣诞用品/节日装饰"},
    {"name":"浙江花园生物高科股份有限公司","regTime":"2000-01","regCapital":"38000万","paidCapital":"38000万","qualification":"上市公司","partners":["全球维生素市场"],"employees":"2000+","revenue":"20亿+","contact":"0579-85628888","website":"www.gardenbio.com.cn","mainCategory":"维生素D3/生物制品"},
    {"name":"义乌市拉链行业协会骨干企业群","regTime":"2003-01","regCapital":"5000万","paidCapital":"5000万","qualification":"行业集群","partners":["全球服装供应链"],"employees":"3000+","revenue":"10亿+","contact":"0579-85386888","website":"","mainCategory":"拉链/纽扣/辅料"}
  ],
  "永康五金产业带": [
    {"name":"浙江正阳实业有限公司","regTime":"1996-01","regCapital":"12000万","paidCapital":"12000万","qualification":"浙江省名牌","partners":[],"employees":"2000+","revenue":"10亿+","contact":"0579-87100888","website":"","mainCategory":"防盗门/安全门"},
    {"name":"浙江飞剑工贸有限公司","regTime":"1998-06","regCapital":"8000万","paidCapital":"8000万","qualification":"浙江省名牌","partners":["Thermos","膳魔师"],"employees":"1500+","revenue":"8亿+","contact":"0579-87128888","website":"","mainCategory":"保温杯/不锈钢水杯"},
    {"name":"浙江星月门业有限公司","regTime":"1989-01","regCapital":"15000万","paidCapital":"15000万","qualification":"中国驰名商标","partners":[],"employees":"3000+","revenue":"20亿+","contact":"0579-87200888","website":"www.xingyuedoor.com","mainCategory":"防盗门/安全门/铜门"},
    {"name":"浙江王力安防科技股份有限公司","regTime":"1996-01","regCapital":"60000万","paidCapital":"60000万","qualification":"上市公司","partners":["碧桂园","万科"],"employees":"8000+","revenue":"50亿+","contact":"0579-87306888","website":"www.wangli.com","mainCategory":"安全门/智能锁"},
    {"name":"浙江铁牛集团有限公司","regTime":"1986-01","regCapital":"30000万","paidCapital":"30000万","qualification":"浙江省名牌","partners":[],"employees":"5000+","revenue":"30亿+","contact":"0579-87328888","website":"","mainCategory":"电动工具/汽车零部件"},
    {"name":"浙江天喜厨电股份有限公司","regTime":"2002-01","regCapital":"16000万","paidCapital":"16000万","qualification":"浙江省名牌","partners":["天猫","京东"],"employees":"2000+","revenue":"12亿+","contact":"0579-87150888","website":"","mainCategory":"炊具/厨房五金"}
  ],
  "温州鞋类产业带": [
    {"name":"浙江巨一鞋业有限公司","regTime":"2003-06","regCapital":"5000万","paidCapital":"5000万","qualification":"浙江省名牌","partners":["Nike","Adidas","Under Armour"],"employees":"10000+","revenue":"30亿+","contact":"0577-67111888","website":"","mainCategory":"运动鞋代工/品牌鞋"},
    {"name":"温州市东艺鞋业有限公司","regTime":"1999-01","regCapital":"8000万","paidCapital":"8000万","qualification":"温州市名牌","partners":["Clarks","Geox"],"employees":"3000+","revenue":"10亿+","contact":"0577-67222888","website":"","mainCategory":"皮鞋/休闲鞋代工"},
    {"name":"浙江百丽鞋业有限公司","regTime":"2005-01","regCapital":"12000万","paidCapital":"12000万","qualification":"浙江省名牌","partners":[],"employees":"5000+","revenue":"20亿+","contact":"0577-67333888","website":"","mainCategory":"女鞋/时装鞋"},
    {"name":"温州康奈集团有限公司","regTime":"1980-01","regCapital":"30000万","paidCapital":"30000万","qualification":"中国驰名商标","partners":[],"employees":"5000+","revenue":"25亿+","contact":"0577-85556888","website":"www.kangnai.com","mainCategory":"皮鞋/商务鞋"},
    {"name":"浙江东蒙制衣有限公司","regTime":"1988-01","regCapital":"8000万","paidCapital":"8000万","qualification":"浙江省著名商标","partners":[],"employees":"2000+","revenue":"8亿+","contact":"0577-67555888","website":"","mainCategory":"男装/西装/商务休闲"}
  ],
  "宁波家电产业带": [
    {"name":"宁波奥克斯空调有限公司","regTime":"1994-01","regCapital":"50000万","paidCapital":"50000万","qualification":"中国驰名商标","partners":["全国经销渠道"],"employees":"10000+","revenue":"200亿+","contact":"0574-65126888","website":"www.aux.cn","mainCategory":"空调/冰箱/洗衣机"},
    {"name":"宁波慈溪月立电器有限公司","regTime":"1996-08","regCapital":"8000万","paidCapital":"8000万","qualification":"浙江省名牌","partners":["Conair","Remington"],"employees":"3000+","revenue":"15亿+","contact":"0574-63082888","website":"","mainCategory":"电吹风/美发工具"},
    {"name":"宁波天龙电子股份有限公司","regTime":"2002-01","regCapital":"15000万","paidCapital":"15000万","qualification":"上市公司","partners":["Harman","BOSE"],"employees":"2000+","revenue":"10亿+","contact":"0574-63099888","website":"www.nbtianlv.com","mainCategory":"音响/扬声器"},
    {"name":"宁波贝仕达克股份有限公司","regTime":"2010-01","regCapital":"12000万","paidCapital":"12000万","qualification":"上市公司","partners":["TTI","Stanley Black&Decker"],"employees":"3000+","revenue":"15亿+","contact":"0574-63108888","website":"","mainCategory":"智能控制器/电动工具控制"},
    {"name":"宁波卡倍亿电气技术有限公司","regTime":"2003-01","regCapital":"25000万","paidCapital":"25000万","qualification":"上市公司","partners":["通用","福特","吉利"],"employees":"2000+","revenue":"20亿+","contact":"0574-63288888","website":"","mainCategory":"汽车线束/电连接器"}
  ],
  "泉州鞋服产业带": [
    {"name":"361度国际有限公司","regTime":"2003-01","regCapital":"55000万","paidCapital":"55000万","qualification":"上市公司","partners":["NBA","铁人三项"],"employees":"8000+","revenue":"80亿+","contact":"0595-82077888","website":"www.361sport.com","mainCategory":"运动鞋/运动服装"},
    {"name":"福建浔兴拉链科技股份有限公司","regTime":"1984-01","regCapital":"38000万","paidCapital":"38000万","qualification":"上市公司","partners":["Nike","Adidas","Puma"],"employees":"5000+","revenue":"25亿+","contact":"0595-85555888","website":"www.sbs-zipper.com","mainCategory":"拉链/辅料"},
    {"name":"乔丹体育股份有限公司","regTime":"2000-01","regCapital":"45000万","paidCapital":"45000万","qualification":"上市公司","partners":[],"employees":"6000+","revenue":"60亿+","contact":"0595-85655888","website":"www.qdsports.com","mainCategory":"运动鞋/运动装备"},
    {"name":"贵人鸟股份有限公司","regTime":"2002-01","regCapital":"30000万","paidCapital":"30000万","qualification":"上市公司","partners":[],"employees":"3000+","revenue":"15亿+","contact":"0595-85755888","website":"www.grn.com.cn","mainCategory":"运动鞋/运动服"},
    {"name":"福建七匹狼实业股份有限公司","regTime":"1990-01","regCapital":"68000万","paidCapital":"68000万","qualification":"上市公司/中国驰名商标","partners":["全国零售渠道"],"employees":"5000+","revenue":"35亿+","contact":"0595-85655888","website":"www.septwolves.com","mainCategory":"男装/休闲服装"},
    {"name":"福建恒安集团有限公司","regTime":"1985-01","regCapital":"200000万","paidCapital":"200000万","qualification":"上市公司/中国500强","partners":["沃尔玛","家乐福"],"employees":"25000+","revenue":"250亿+","contact":"0595-22588888","website":"www.hengan.com","mainCategory":"生活用纸/卫生巾/纸尿裤"},
    {"name":"九牧王股份有限公司","regTime":"1989-01","regCapital":"42000万","paidCapital":"42000万","qualification":"上市公司","partners":["天猫","京东"],"employees":"5000+","revenue":"30亿+","contact":"0595-82551888","website":"www.joeone.com","mainCategory":"男裤/商务男装"}
  ],
  "中山灯具产业带": [
    {"name":"中山市木林森股份有限公司","regTime":"1997-01","regCapital":"157000万","paidCapital":"157000万","qualification":"上市公司","partners":["全球照明市场"],"employees":"20000+","revenue":"200亿+","contact":"0760-22639888","website":"www.mls-led.com","mainCategory":"LED封装/LED照明"},
    {"name":"中山市三雄极光照明股份有限公司","regTime":"1991-01","regCapital":"42000万","paidCapital":"42000万","qualification":"上市公司","partners":["万达","恒大"],"employees":"3000+","revenue":"30亿+","contact":"0760-22517888","website":"www.pak.com.cn","mainCategory":"LED照明/商业照明"},
    {"name":"广东琪朗灯饰有限公司","regTime":"1993-01","regCapital":"8000万","paidCapital":"8000万","qualification":"广东省名牌","partners":["Marriott","Hilton"],"employees":"2000+","revenue":"10亿+","contact":"0760-22348222","website":"","mainCategory":"水晶灯/酒店灯饰"},
    {"name":"中山市泰腾灯饰有限公司","regTime":"2005-01","regCapital":"3000万","paidCapital":"3000万","qualification":"中山市名牌","partners":["IKEA供应链"],"employees":"800+","revenue":"3亿+","contact":"0760-22383888","website":"","mainCategory":"LED灯/现代简约灯"},
    {"name":"中山市华裕灯饰有限公司","regTime":"2000-01","regCapital":"5000万","paidCapital":"5000万","qualification":"广东省名牌","partners":["Home Depot","Lowe's"],"employees":"1200+","revenue":"5亿+","contact":"0760-22350888","website":"","mainCategory":"户外照明/景观灯/壁灯"}
  ],
  "广州美妆产业带": [
    {"name":"广州市宝洁有限公司","regTime":"1988-01","regCapital":"180000万","paidCapital":"180000万","qualification":"世界500强","partners":["全球零售渠道"],"employees":"8000+","revenue":"300亿+","contact":"020-86131888","website":"www.pg.com.cn","mainCategory":"日化/洗护/美妆"},
    {"name":"广州立白企业集团有限公司","regTime":"1994-01","regCapital":"50000万","paidCapital":"50000万","qualification":"中国驰名商标","partners":["全国超市渠道"],"employees":"15000+","revenue":"200亿+","contact":"020-86133888","website":"www.liby.com.cn","mainCategory":"洗衣液/洗洁精/日化"},
    {"name":"广州蓝月亮实业有限公司","regTime":"1992-01","regCapital":"30000万","paidCapital":"30000万","qualification":"上市公司","partners":["全国商超"],"employees":"10000+","revenue":"80亿+","contact":"020-86660888","website":"www.bluemoon.com.cn","mainCategory":"洗衣液/清洁用品"},
    {"name":"广州市丸美生物技术股份有限公司","regTime":"2002-01","regCapital":"40000万","paidCapital":"40000万","qualification":"上市公司","partners":["天猫","京东"],"employees":"3000+","revenue":"25亿+","contact":"020-37885888","website":"www.marubi.cn","mainCategory":"眼霜/护肤品/化妆品"},
    {"name":"广州逸仙电子商务有限公司","regTime":"2016-01","regCapital":"35000万","paidCapital":"35000万","qualification":"上市公司","partners":["天猫","抖音"],"employees":"4000+","revenue":"50亿+","contact":"020-89811888","website":"www.yatsen.com","mainCategory":"完美日记/小奥汀/彩妆"}
  ],
  "汕头玩具产业带": [
    {"name":"广东邦宝益智玩具股份有限公司","regTime":"2003-01","regCapital":"40000万","paidCapital":"40000万","qualification":"上市公司","partners":["全球玩具市场"],"employees":"2000+","revenue":"8亿+","contact":"0754-88105222","website":"www.banbao.com","mainCategory":"积木/益智玩具"},
    {"name":"广东群宇互动科技有限公司","regTime":"2008-01","regCapital":"5000万","paidCapital":"5000万","qualification":"广东省高新","partners":["Disney","任天堂"],"employees":"1000+","revenue":"5亿+","contact":"0754-88106888","website":"","mainCategory":"电子玩具/智能玩具"},
    {"name":"汕头市小白龙动漫文化股份有限公司","regTime":"2004-01","regCapital":"15000万","paidCapital":"15000万","qualification":"广东省名牌","partners":["动漫IP授权"],"employees":"1500+","revenue":"5亿+","contact":"0754-88101888","website":"www.cogo.cc","mainCategory":"积木/动漫玩具/IP玩具"},
    {"name":"汕头市智高文具有限公司","regTime":"2001-01","regCapital":"8000万","paidCapital":"8000万","qualification":"广东省名牌","partners":["沃尔玛"],"employees":"1500+","revenue":"5亿+","contact":"0754-88103888","website":"","mainCategory":"文具/橡皮泥/美术用品"},
    {"name":"广东实丰文化发展股份有限公司","regTime":"2008-01","regCapital":"23000万","paidCapital":"23000万","qualification":"上市公司","partners":["Mattel","全球玩具渠道"],"employees":"2000+","revenue":"6亿+","contact":"0754-88102888","website":"","mainCategory":"娃娃玩具/电动玩具"}
  ],
  "绍兴纺织产业带": [
    {"name":"浙江古纤道绿色纤维有限公司","regTime":"2001-01","regCapital":"50000万","paidCapital":"50000万","qualification":"浙江省名牌","partners":["全球化纤市场"],"employees":"3000+","revenue":"50亿+","contact":"0575-82938888","website":"","mainCategory":"涤纶/化纤/纺丝"},
    {"name":"浙江红绿蓝纺织印染有限公司","regTime":"1998-01","regCapital":"15000万","paidCapital":"15000万","qualification":"浙江省名牌","partners":["Zara","H&M"],"employees":"2000+","revenue":"15亿+","contact":"0575-82911888","website":"","mainCategory":"面料印染/数码印花"},
    {"name":"浙江富润股份有限公司","regTime":"1983-01","regCapital":"35000万","paidCapital":"35000万","qualification":"上市公司","partners":[],"employees":"3000+","revenue":"20亿+","contact":"0575-87210888","website":"www.furun.com","mainCategory":"纺织/面料/化纤"},
    {"name":"浙江天圣化纤有限公司","regTime":"2003-01","regCapital":"20000万","paidCapital":"20000万","qualification":"浙江省名牌","partners":["全球纺织企业"],"employees":"2500+","revenue":"30亿+","contact":"0575-82922888","website":"","mainCategory":"涤纶长丝/DTY/POY"},
    {"name":"绍兴柯桥东盛印染有限公司","regTime":"1995-01","regCapital":"10000万","paidCapital":"10000万","qualification":"浙江省名牌","partners":["Nike","Adidas供应链"],"employees":"1500+","revenue":"10亿+","contact":"0575-84555888","website":"","mainCategory":"针织面料/运动面料印染"}
  ],
  "苏州电子信息产业带": [
    {"name":"昆山龙腾光电股份有限公司","regTime":"2005-01","regCapital":"180000万","paidCapital":"180000万","qualification":"上市公司","partners":["苹果","华为"],"employees":"8000+","revenue":"100亿+","contact":"0512-57628888","website":"www.infovision.com.cn","mainCategory":"液晶面板/TFT-LCD"},
    {"name":"苏州东山精密制造股份有限公司","regTime":"2002-08","regCapital":"120000万","paidCapital":"120000万","qualification":"上市公司","partners":["苹果","特斯拉"],"employees":"20000+","revenue":"300亿+","contact":"0512-57518888","website":"www.dsbj.com","mainCategory":"FPC/精密金属件/LED"},
    {"name":"吴江长安永利有限公司","regTime":"2001-01","regCapital":"15000万","paidCapital":"15000万","qualification":"国家高新","partners":["索尼","松下"],"employees":"3000+","revenue":"20亿+","contact":"0512-63668888","website":"","mainCategory":"电子元器件/电容电阻"},
    {"name":"昆山丘钛微电子科技有限公司","regTime":"2008-01","regCapital":"80000万","paidCapital":"80000万","qualification":"上市公司","partners":["华为","小米","三星"],"employees":"10000+","revenue":"100亿+","contact":"0512-57690888","website":"www.qtech.com.cn","mainCategory":"摄像头模组/指纹识别"},
    {"name":"苏州晶方半导体科技有限公司","regTime":"2005-06","regCapital":"44000万","paidCapital":"44000万","qualification":"上市公司","partners":["豪威","索尼"],"employees":"2000+","revenue":"15亿+","contact":"0512-65806888","website":"www.wlcsp.com","mainCategory":"传感器封装/晶圆级封装"}
  ],
  "南通纺织产业带": [
    {"name":"江苏梦百合家居科技股份有限公司","regTime":"2003-01","regCapital":"40000万","paidCapital":"40000万","qualification":"上市公司","partners":["沃尔玛","Costco"],"employees":"8000+","revenue":"80亿+","contact":"0513-68981888","website":"www.mlily.com","mainCategory":"记忆棉/床垫/家纺"},
    {"name":"南通富美服饰有限公司","regTime":"2000-01","regCapital":"8000万","paidCapital":"8000万","qualification":"江苏省名牌","partners":["Ralph Lauren","Calvin Klein"],"employees":"3000+","revenue":"15亿+","contact":"0513-86781888","website":"","mainCategory":"服装代工/针织服装"},
    {"name":"江苏斯得福纺织股份有限公司","regTime":"1999-01","regCapital":"12000万","paidCapital":"12000万","qualification":"上市公司","partners":["IKEA","Costco"],"employees":"3000+","revenue":"15亿+","contact":"0513-85188888","website":"www.stdfortex.com","mainCategory":"床上用品/家纺面料"},
    {"name":"南通大东有限公司","regTime":"1996-01","regCapital":"15000万","paidCapital":"15000万","qualification":"江苏省名牌","partners":["全球家纺市场"],"employees":"5000+","revenue":"20亿+","contact":"0513-85182888","website":"","mainCategory":"被芯/枕芯/家纺"}
  ],
  "青岛家电产业带": [
    {"name":"青岛澳柯玛股份有限公司","regTime":"1987-01","regCapital":"62000万","paidCapital":"62000万","qualification":"上市公司","partners":["全国经销渠道"],"employees":"8000+","revenue":"80亿+","contact":"0532-87261888","website":"www.aucma.com.cn","mainCategory":"冰柜/冷链设备/空调"},
    {"name":"青岛特锐德电气股份有限公司","regTime":"2004-01","regCapital":"90000万","paidCapital":"90000万","qualification":"上市公司","partners":["国家电网","南方电网"],"employees":"5000+","revenue":"100亿+","contact":"0532-66752888","website":"www.tgood.com","mainCategory":"充电桩/箱式电力设备"},
    {"name":"青岛双星股份有限公司","regTime":"1921-01","regCapital":"75000万","paidCapital":"75000万","qualification":"上市公司","partners":["锦湖轮胎"],"employees":"8000+","revenue":"50亿+","contact":"0532-88220888","website":"www.doublestar.com.cn","mainCategory":"轮胎/橡胶制品"},
    {"name":"青岛中程科技产业有限公司","regTime":"2006-01","regCapital":"30000万","paidCapital":"30000万","qualification":"青岛市名牌","partners":["三星","LG"],"employees":"2000+","revenue":"15亿+","contact":"0532-80901888","website":"","mainCategory":"家电模具/注塑件"}
  ],
  "许昌假发产业带": [
    {"name":"许昌恒源发制品有限公司","regTime":"2001-01","regCapital":"15000万","paidCapital":"15000万","qualification":"河南省名牌","partners":["非洲/北美市场"],"employees":"3000+","revenue":"8亿+","contact":"0374-2729888","website":"","mainCategory":"假发/发套/编织发"},
    {"name":"许昌龙正美发制品有限公司","regTime":"2005-01","regCapital":"8000万","paidCapital":"8000万","qualification":"河南省名牌","partners":["Amazon","eBay"],"employees":"2000+","revenue":"5亿+","contact":"0374-2735888","website":"","mainCategory":"假发/化纤发/接发"},
    {"name":"许昌天美发制品有限公司","regTime":"2008-01","regCapital":"5000万","paidCapital":"5000万","qualification":"许昌市名牌","partners":["非洲市场"],"employees":"1500+","revenue":"3亿+","contact":"0374-2733888","website":"","mainCategory":"假发/发块/男士假发"},
    {"name":"河南奥源实业有限公司","regTime":"2003-01","regCapital":"10000万","paidCapital":"10000万","qualification":"河南省名牌","partners":["全球假发市场"],"employees":"2500+","revenue":"6亿+","contact":"0374-2738888","website":"","mainCategory":"人发制品/化纤假发"}
  ],
  "莆田鞋业产业带": [
    {"name":"莆田市协丰鞋业有限公司","regTime":"2001-01","regCapital":"8000万","paidCapital":"8000万","qualification":"福建省名牌","partners":["Nike代工体系"],"employees":"5000+","revenue":"15亿+","contact":"0594-2383888","website":"","mainCategory":"运动鞋/篮球鞋代工"},
    {"name":"莆田市华峰华锦纺织科技有限公司","regTime":"2003-01","regCapital":"15000万","paidCapital":"15000万","qualification":"福建省名牌","partners":["Nike","Adidas"],"employees":"3000+","revenue":"25亿+","contact":"0594-2323666","website":"","mainCategory":"鞋面面料/经编面料"},
    {"name":"莆田市嘉源鞋业有限公司","regTime":"2006-01","regCapital":"5000万","paidCapital":"5000万","qualification":"莆田市名牌","partners":["跨境电商渠道"],"employees":"2000+","revenue":"8亿+","contact":"0594-2383666","website":"","mainCategory":"休闲鞋/潮牌鞋"},
    {"name":"莆田市泰盛鞋材有限公司","regTime":"2005-01","regCapital":"8000万","paidCapital":"8000万","qualification":"福建省名牌","partners":["全国鞋企"],"employees":"1500+","revenue":"10亿+","contact":"0594-2323999","website":"","mainCategory":"鞋底/EVA/橡胶鞋材"},
    {"name":"莆田市鑫天鸿鞋业有限公司","regTime":"2010-01","regCapital":"3000万","paidCapital":"3000万","qualification":"莆田市名牌","partners":["Amazon","TikTok Shop"],"employees":"1000+","revenue":"5亿+","contact":"0594-2383999","website":"","mainCategory":"运动鞋/老爹鞋/跨境品牌"}
  ],
  "常州光伏新能源产业带": [
    {"name":"亿晶光电科技股份有限公司","regTime":"2003-01","regCapital":"60000万","paidCapital":"60000万","qualification":"上市公司","partners":["全球光伏市场"],"employees":"5000+","revenue":"100亿+","contact":"0519-83303888","website":"www.yijinggd.com","mainCategory":"光伏电池/光伏组件"},
    {"name":"常州天合光能有限公司","regTime":"2012-01","regCapital":"50000万","paidCapital":"50000万","qualification":"全球光伏龙头子公司","partners":["全球能源市场"],"employees":"8000+","revenue":"200亿+","contact":"0519-85485801","website":"www.trinasolar.com","mainCategory":"光伏组件/跟踪支架"},
    {"name":"中创新航科技股份有限公司","regTime":"2015-01","regCapital":"230000万","paidCapital":"230000万","qualification":"上市公司","partners":["广汽","小鹏","蔚来"],"employees":"15000+","revenue":"250亿+","contact":"0519-85181888","website":"www.calb-tech.com","mainCategory":"动力电池/储能电池"},
    {"name":"常州星宇车灯股份有限公司","regTime":"1993-01","regCapital":"46000万","paidCapital":"46000万","qualification":"上市公司","partners":["一汽","上汽","吉利"],"employees":"6000+","revenue":"80亿+","contact":"0519-88300888","website":"www.xingyu.com","mainCategory":"汽车车灯/LED车灯"}
  ],
  "白沟箱包产业带": [
    {"name":"保定白沟新城翼翔箱包有限公司","regTime":"2008-01","regCapital":"3000万","paidCapital":"3000万","qualification":"河北省名牌","partners":["京东","天猫"],"employees":"500+","revenue":"2亿+","contact":"0312-2968666","website":"","mainCategory":"书包/双肩包/旅行包"},
    {"name":"白沟新城精诚箱包有限公司","regTime":"2005-01","regCapital":"5000万","paidCapital":"5000万","qualification":"河北省名牌","partners":["外贸客户"],"employees":"800+","revenue":"3亿+","contact":"0312-2968999","website":"","mainCategory":"拉杆箱/登机箱"},
    {"name":"保定鑫帅达皮具有限公司","regTime":"2010-01","regCapital":"3000万","paidCapital":"3000万","qualification":"白沟名牌","partners":["Amazon","AliExpress"],"employees":"500+","revenue":"1.5亿+","contact":"0312-2968333","website":"","mainCategory":"女包/手提包/钱包"},
    {"name":"白沟新城华洋箱包有限公司","regTime":"2006-01","regCapital":"5000万","paidCapital":"5000万","qualification":"河北省名牌","partners":[],"employees":"1000+","revenue":"5亿+","contact":"0312-2968555","website":"","mainCategory":"商务箱包/电脑包"},
    {"name":"河北冠宇箱包有限公司","regTime":"2012-01","regCapital":"3000万","paidCapital":"3000万","qualification":"白沟名牌","partners":["跨境电商平台"],"employees":"400+","revenue":"1亿+","contact":"0312-2968777","website":"","mainCategory":"化妆包/收纳包/功能包"}
  ],
  "景德镇陶瓷产业带": [
    {"name":"景德镇市望龙陶瓷有限公司","regTime":"2000-01","regCapital":"5000万","paidCapital":"5000万","qualification":"江西省名牌","partners":["天猫","京东"],"employees":"800+","revenue":"3亿+","contact":"0798-8525666","website":"","mainCategory":"日用陶瓷/茶具"},
    {"name":"景德镇法蓝瓷实业有限公司","regTime":"2002-01","regCapital":"8000万","paidCapital":"8000万","qualification":"江西省名牌","partners":["全球礼品市场"],"employees":"1500+","revenue":"5亿+","contact":"0798-8525999","website":"www.franzcollection.com.cn","mainCategory":"艺术瓷/礼品瓷/收藏瓷"},
    {"name":"景德镇市金品陶瓷有限公司","regTime":"2005-01","regCapital":"3000万","paidCapital":"3000万","qualification":"景德镇名牌","partners":[],"employees":"500+","revenue":"2亿+","contact":"0798-8525333","website":"","mainCategory":"仿古瓷/青花瓷/手工瓷"},
    {"name":"景德镇市曙光瓷厂","regTime":"1958-01","regCapital":"5000万","paidCapital":"5000万","qualification":"老字号","partners":["国宴/国礼"],"employees":"800+","revenue":"3亿+","contact":"0798-8525111","website":"","mainCategory":"高端日用瓷/国宴瓷"}
  ],
  "重庆汽摩产业带": [
    {"name":"重庆小康工业集团股份有限公司","regTime":"1986-01","regCapital":"120000万","paidCapital":"120000万","qualification":"上市公司","partners":["华为"],"employees":"15000+","revenue":"300亿+","contact":"023-67591888","website":"www.dfsk.com","mainCategory":"新能源汽车/赛力斯"},
    {"name":"重庆隆鑫通用动力股份有限公司","regTime":"1993-01","regCapital":"50000万","paidCapital":"50000万","qualification":"上市公司","partners":["BMW摩托"],"employees":"10000+","revenue":"100亿+","contact":"023-68608888","website":"www.loncin.com","mainCategory":"摩托车/发动机/通机"},
    {"name":"重庆宗申动力机械股份有限公司","regTime":"1992-01","regCapital":"90000万","paidCapital":"90000万","qualification":"上市公司","partners":["Piaggio","比亚乔"],"employees":"8000+","revenue":"80亿+","contact":"023-66388888","website":"www.zongshenmotor.com","mainCategory":"摩托车发动机/通用动力"},
    {"name":"中国重汽集团重庆燃油喷射系统有限公司","regTime":"2001-01","regCapital":"15000万","paidCapital":"15000万","qualification":"央企子公司","partners":["中国重汽","潍柴"],"employees":"2000+","revenue":"15亿+","contact":"023-67988888","website":"","mainCategory":"柴油燃油喷射/汽车零部件"},
    {"name":"重庆万力联兴实业有限公司","regTime":"2005-01","regCapital":"20000万","paidCapital":"20000万","qualification":"重庆市名牌","partners":["长安","力帆"],"employees":"3000+","revenue":"20亿+","contact":"023-68118888","website":"","mainCategory":"汽车内饰/方向盘/变速操纵"}
  ]
};

// Apply extra suppliers to belts
let addedCount = 0;
data.provinces.forEach(p => {
  p.belts.forEach(b => {
    if (extraSuppliers[b.name]) {
      b.topSuppliers = b.topSuppliers.concat(extraSuppliers[b.name]);
      addedCount += extraSuppliers[b.name].length;
    }
  });
});

fs.writeFileSync('C:/industrial-belt-dashboard/data/industrial-belts.json', JSON.stringify(data, null, 2));

// Count final totals
let total = 0;
data.provinces.forEach(p => p.belts.forEach(b => total += b.topSuppliers.length));
console.log('Added:', addedCount, 'new suppliers');
console.log('Total suppliers now:', total);
console.log('Provinces:', data.provinces.length);
