'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OptimizedImage } from '@/components/ui/optimized-image';
import {
  StarBold,
  CheckCircleBold,
  LikeBold,
  ChatSquareBold,
  FlagBold,
  AltArrowDownLinear,
} from '@solar-icons/react-perf';
import type { SchoolProfile, Review } from '@/types/school';

interface ReviewsTabProps {
  school: SchoolProfile;
}

/**
 * Таб "Отзывы"
 * 
 * Включает:
 * - Заголовок с кнопкой "Написать отзыв"
 * - Сводка рейтинга (общий рейтинг + breakdown по категориям)
 * - Фильтры (Все, 5★, 4★, 3★, 2★, 1★)
 * - Сортировка
 * - Список отзывов
 * - Ответы школы на отзывы
 * - Кнопка "Загрузить ещё отзывы"
 */
export function ReviewsTab({ school }: ReviewsTabProps) {
  const [filter, setFilter] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState('newest');
  const [reviews, setReviews] = useState<Review[]>(school.reviews || []);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  useEffect(() => {
    loadReviews();
  }, [filter, sortBy, school.id]);
  
  const loadReviews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter) params.set('filter', filter.toString());
      params.set('sort', sortBy);
      params.set('page', '1');
      
      const response = await fetch(`/api/schools/${school.slug}/reviews?${params}`);
      const data = await response.json();
      
      setReviews(data.reviews || []);
      setHasMore(data.pagination.page < data.pagination.totalPages);
      setPage(1);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const loadMore = async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter) params.set('filter', filter.toString());
      params.set('sort', sortBy);
      params.set('page', (page + 1).toString());
      
      const response = await fetch(`/api/schools/${school.slug}/reviews?${params}`);
      const data = await response.json();
      
      setReviews((prev) => [...prev, ...(data.reviews || [])]);
      setHasMore(data.pagination.page < data.pagination.totalPages);
      setPage((prev) => prev + 1);
    } catch (error) {
      console.error('Error loading more reviews:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const ratingCategories = school.rating.breakdown
    ? [
        { key: 'quality', label: 'Качество обучения', value: school.rating.breakdown.quality },
        { key: 'teachers', label: 'Учителя', value: school.rating.breakdown.teachers },
        {
          key: 'infrastructure',
          label: 'Инфраструктура',
          value: school.rating.breakdown.infrastructure,
        },
        { key: 'meals', label: 'Питание', value: school.rating.breakdown.meals },
        {
          key: 'communication',
          label: 'Коммуникация',
          value: school.rating.breakdown.communication,
        },
      ]
    : [];
  
  return (
    <div className="space-y-6">
      {/* Header with Write Review Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Отзывы</h2>
        <Button>
            <ChatSquareBold className="w-4 h-4 mr-2" />
          Написать отзыв
        </Button>
      </div>
      
      {/* Rating Summary */}
      {ratingCategories.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Overall Rating */}
              <div className="text-center">
                <div className="text-5xl font-bold text-gray-900 mb-2">
                  {(school.rating.score / 20).toFixed(1)}
                </div>
                <div className="flex justify-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarBold
                      key={star}
                      className={`w-6 h-6 ${
                        star <= Math.round(school.rating.score / 20)
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-gray-200 text-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-gray-500">
                  {school.rating.reviewCount} отзывов
                </div>
              </div>
              
              {/* Rating Breakdown */}
              <div className="space-y-3">
                {ratingCategories.map((cat) => (
                  <div key={cat.key} className="flex items-center gap-3">
                    <div className="w-32 text-sm text-gray-600">{cat.label}</div>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full"
                        style={{ width: `${(cat.value / 5) * 100}%` }}
                      />
                    </div>
                    <div className="w-8 text-sm text-gray-600 text-right">
                      {cat.value.toFixed(1)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Filters */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex gap-2">
          <Button
            variant={filter === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(null)}
          >
            Все
          </Button>
          {[5, 4, 3, 2, 1].map((rating) => (
            <Button
              key={rating}
              variant={filter === rating ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(rating)}
            >
              {rating}★
            </Button>
          ))}
        </div>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
        >
          <option value="newest">Сначала новые</option>
          <option value="oldest">Сначала старые</option>
          <option value="highest">Высокий рейтинг</option>
          <option value="lowest">Низкий рейтинг</option>
          <option value="helpful">Полезные</option>
        </select>
      </div>
      
      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
      
      {/* Load More */}
      {hasMore && (
        <div className="text-center">
          <Button variant="outline" onClick={loadMore} disabled={loading}>
            {loading ? 'Загрузка...' : 'Загрузить ещё отзывы'}
            <AltArrowDownLinear className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}

// Review Card Component
function ReviewCard({ review }: { review: Review }) {
  return (
    <Card>
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
              {review.author.avatar ? (
                <OptimizedImage
                  src={review.author.avatar}
                  alt={review.author.name}
                  width={48}
                  height={48}
                  className="object-cover"
                  sizes="48px"
                />
              ) : (
                <span className="text-xl">👤</span>
              )}
            </div>
            
            {/* Author Info */}
            <div>
              <div className="font-medium text-gray-900">{review.author.name}</div>
              <div className="text-sm text-gray-500">{review.author.role}</div>
              {review.author.isVerified && (
                <Badge variant="outline" className="mt-1 text-xs text-green-700 border-green-200 bg-green-50">
                  <CheckCircleBold className="w-3 h-3 mr-1" />
                  Верифицированный родитель
                </Badge>
              )}
            </div>
          </div>
          
          {/* Rating & Date */}
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarBold
                  key={star}
                  className={`w-4 h-4 ${
                    star <= review.rating
                      ? 'fill-amber-400 text-amber-400'
                      : 'fill-gray-200 text-gray-200'
                  }`}
                />
              ))}
              <span className="ml-1 font-medium">{review.rating}.0</span>
            </div>
            <div className="text-sm text-gray-500 mt-1">{review.date}</div>
          </div>
        </div>
        
        {/* Content */}
        <p className="text-gray-700 mb-4">{review.content}</p>
        
        {/* Pros & Cons */}
        {(review.pros || review.cons) && (
          <div className="space-y-2 mb-4">
            {review.pros && review.pros.length > 0 && (
              <div className="flex items-start gap-2">
                <span className="text-green-600">👍</span>
                <div>
                  <span className="text-sm font-medium text-gray-700">Плюсы: </span>
                  <span className="text-sm text-gray-600">{review.pros.join(', ')}</span>
                </div>
              </div>
            )}
            {review.cons && review.cons.length > 0 && (
              <div className="flex items-start gap-2">
                <span className="text-red-600">👎</span>
                <div>
                  <span className="text-sm font-medium text-gray-700">Минусы: </span>
                  <span className="text-sm text-gray-600">{review.cons.join(', ')}</span>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Actions */}
        <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
          <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition">
            <LikeBold className="w-4 h-4" />
            Полезно ({review.helpfulCount})
          </button>
          <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition">
            <ChatSquareBold className="w-4 h-4" />
            Ответить
          </button>
          <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 ml-auto transition">
            <FlagBold className="w-4 h-4" />
            Пожаловаться
          </button>
        </div>
        
        {/* School Response */}
        {review.schoolResponse && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-blue-800">💬 Ответ от школы</span>
              <span className="text-xs text-blue-600">{review.schoolResponse.date}</span>
            </div>
            <p className="text-sm text-blue-900">{review.schoolResponse.content}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

