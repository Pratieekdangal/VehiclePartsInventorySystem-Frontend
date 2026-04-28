import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Star } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Input';
import EmptyState from '../../components/ui/EmptyState';
import Avatar from '../../components/ui/Avatar';
import Skeleton from '../../components/ui/Skeleton';
import { reviews } from '../../api/endpoints';
import { formatDate } from '../../lib/format';
import { cn } from '../../lib/cn';

export default function CustomerReviews() {
  const [items, setItems] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = () => reviews.visible().then(setItems).catch(() => setItems([]));

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e?.preventDefault();
    if (!rating) {
      toast.error('Pick a star rating first');
      return;
    }
    setSubmitting(true);
    try {
      await reviews.create({ rating, comment });
      toast.success('Thanks for the review');
      setRating(0);
      setComment('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not post');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="px-1">
        <h1 className="font-display font-bold text-2xl tracking-h2">Reviews</h1>
        <p className="vps-body-sm mt-1">Tell us how your last visit went.</p>
      </div>

      <Card className="p-4">
        <form onSubmit={submit} className="flex flex-col gap-3.5">
          <div>
            <span className="vps-label mb-2 block">Your rating</span>
            <div className="flex gap-2 justify-center py-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  aria-label={`${n} stars`}
                  className={cn(
                    'p-1.5 rounded-sm transition-transform active:scale-95',
                    n <= rating ? 'text-amber-400' : 'text-steel-200',
                  )}
                >
                  <Star className={cn('w-7 h-7', n <= rating && 'fill-amber-400')} />
                </button>
              ))}
            </div>
          </div>

          <Textarea
            label="Comment"
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What stood out — fast service, fair pricing, friendly staff?"
          />

          <Button type="submit" disabled={submitting || !rating}>
            {submitting ? 'Posting…' : 'Post review'}
          </Button>
        </form>
      </Card>

      <div>
        <h2 className="font-display font-bold text-lg tracking-h2 mb-2 px-1">Community reviews</h2>
        {items === null ? (
          <div className="flex flex-col gap-2.5">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={Star}
            title="Be the first to leave a review"
            body="Your feedback helps other customers and the workshop improve."
          />
        ) : (
          <div className="flex flex-col gap-2.5">
            {items.map((r) => (
              <Card key={r.id} className="p-3.5">
                <div className="flex items-start gap-2.5">
                  <Avatar name={r.customerName} size={32} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm">{r.customerName}</p>
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              'w-3.5 h-3.5',
                              i < r.rating ? 'text-amber-400 fill-amber-400' : 'text-steel-200',
                            )}
                          />
                        ))}
                      </div>
                      <span className="text-[11px] text-fg-3 ml-auto">{formatDate(r.createdAt)}</span>
                    </div>
                    {r.comment && <p className="text-sm text-fg-2 mt-1.5 leading-snug">{r.comment}</p>}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
