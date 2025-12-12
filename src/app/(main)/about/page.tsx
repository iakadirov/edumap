import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AboutPage() {
  return (
    <div className="container-wrapper py-16">
      <div className="container-content">
        <div className="container-inner">
          <div className="mx-auto max-w-4xl space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold">Loyiha haqida</h1>
              <p className="text-lg text-muted-foreground">
                EduMap.uz — Oʻzbekistonning yagona taʼlim platformasi
              </p>
            </div>

            {/* Main Content */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Bizning maqsadimiz</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-gray max-w-none">
                  <p className="text-muted-foreground">
                    EduMap.uz — bu ota-onalarga bolalari uchun eng yaxshi taʼlim muassasalarini topishda yordam beruvchi platforma. 
                    Biz Oʻzbekistondagi barcha maktablar haqida toʻliq, shaffof va ishonchli maʼlumotlarni bitta joyda toʻpladik.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Nima uchun EduMap.uz?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">📊 Toʻliq maʼlumotlar</h3>
                    <p className="text-muted-foreground">
                      Har bir maktab haqida batafsil maʼlumotlar: narxlar, oʻqish dasturlari, sinflar, xizmatlar va boshqalar.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">⭐ Halol sharhlar</h3>
                    <p className="text-muted-foreground">
                      Ota-onalarning haqiqiy tajribalari va sharhlari. Faqat tasdiqlangan sharhlar koʻrsatiladi.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">🔍 Qulay qidiruv</h3>
                    <p className="text-muted-foreground">
                      Filtrlar yordamida shahringizdagi eng yaxshi maktablarni toping: narx, tuman, maktab turi va boshqalar.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">🤖 AI tavsiyalar</h3>
                    <p className="text-muted-foreground">
                      Sunʼiy intellekt texnologiyalari yordamida bolangiz uchun eng mos maktablarni toping.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Loyiha haqida</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    EduMap.uz — bu ochiq loyiha boʻlib, maqsadi Oʻzbekistonda taʼlim sohasini yanada shaffof va qulay qilish. 
                    Biz har bir ota-onaga oʻz bolasi uchun eng yaxshi tanlovni qilishda yordam beramiz.
                  </p>
                  <p className="text-muted-foreground">
                    Platforma doimiy ravishda yangilanadi va yaxshilanadi. Sizning sharhlaringiz va takliflaringiz biz uchun juda muhim.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Aloqa</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Savollar, takliflar yoki sharhlar uchun biz bilan bogʻlaning:
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>📧 Email: info@edumap.uz</li>
                    <li>📍 Manzil: Oʻzbekiston, Toshkent</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

