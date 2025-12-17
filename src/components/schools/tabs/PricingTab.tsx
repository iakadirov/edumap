'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { SchoolProfile } from '@/types/school';

interface PricingTabProps {
  school: SchoolProfile;
}

/**
 * Таб "Цены"
 * 
 * Включает:
 * - Стоимость обучения по классам (таблица)
 * - Дополнительные сборы (вступительный взнос, учебники, форма)
 * - Скидки (для братьев/сестер, раннее бронирование и т.д.)
 * - Стипендии
 * - Способы оплаты
 * - График оплаты
 */
export function PricingTab({ school }: PricingTabProps) {
  const pricing = school.pricing;
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };
  
  return (
    <div className="space-y-8">
      {/* Tuition */}
      {pricing?.tuition && pricing.tuition.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Стоимость обучения</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Классы</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900">
                        В месяц
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900">
                        В год
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pricing.tuition.map((tier, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="py-3 px-4 text-gray-700">{tier.grades}</td>
                        <td className="py-3 px-4 text-right font-medium text-gray-900">
                          {formatPrice(tier.monthly)} {tier.currency === 'UZS' ? 'сум' : '$'}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-gray-900">
                          {formatPrice(tier.yearly)} {tier.currency === 'UZS' ? 'сум' : '$'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>
      )}
      
      {/* Additional Fees */}
      {pricing?.additionalFees && pricing.additionalFees.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Дополнительные сборы</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {pricing.additionalFees.map((fee, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <div className="font-medium text-gray-900">{fee.name}</div>
                      <div className="text-sm text-gray-500">{fee.frequency}</div>
                    </div>
                    <div className="font-semibold text-gray-900">
                      {formatPrice(fee.amount)} {school.fee.currency === 'UZS' ? 'сум' : '$'}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      )}
      
      {/* Discounts */}
      {pricing?.discounts && pricing.discounts.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Скидки</h2>
          <div className="space-y-3">
            {pricing.discounts.map((discount, idx) => (
              <Card key={idx}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 mb-1">{discount.name}</div>
                      <div className="text-sm text-gray-600">{discount.conditions}</div>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      -{discount.percentage}%
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
      
      {/* Scholarships */}
      {pricing?.scholarships && pricing.scholarships.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Стипендии</h2>
          <div className="space-y-3">
            {pricing.scholarships.map((scholarship, idx) => (
              <Card key={idx}>
                <CardContent className="pt-6">
                  <div className="font-semibold text-gray-900 mb-1">{scholarship.name}</div>
                  <div className="text-sm text-gray-600 mb-2">{scholarship.description}</div>
                  <div className="text-sm text-gray-500">Покрытие: {scholarship.coverage}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
      
      {/* Payment Methods */}
      {pricing?.paymentMethods && pricing.paymentMethods.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Способы оплаты</h2>
          <Card>
            <CardContent className="pt-6">
              <ul className="space-y-2">
                {pricing.paymentMethods.map((method, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span className="text-gray-700">{method}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
      )}
      
      {/* Payment Schedule */}
      {pricing?.paymentSchedule && (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">График оплаты</h2>
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-700 whitespace-pre-line">{pricing.paymentSchedule}</p>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}

