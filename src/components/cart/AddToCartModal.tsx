'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import { useCart } from '@/components/providers/cart-provider'

export function AddToCartModal() {
  const { state, dispatch } = useCart()
  const item = state.lastAddedItem

  const handleOpenChange = (open: boolean) => {
    if (!open) dispatch({ type: 'CLEAR_LAST_ADDED' })
  }

  if (!item) return null

  return (
    <Dialog open={!!item} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton={true}>
        <DialogHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Check className="h-4 w-4" />
          </div>
          <DialogTitle className="text-base font-semibold">
            Article ajouté au panier
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-4 py-3">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
            <Image
              src={item.image || '/placeholder-product.jpg'}
              alt={item.name}
              fill
              className="object-cover"
              sizes="80px"
            />
          </div>
          <p className="text-sm font-medium text-foreground line-clamp-2 pt-1">
            {item.name}
          </p>
        </div>

        <div className="space-y-4 border-t border-border pt-4">
          <label className="flex items-start gap-3 text-sm text-muted-foreground">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
              id="add-to-cart-tc"
            />
            <span>
              J&apos;ai lu et j&apos;accepte les{' '}
              <Link href="/terms" className="text-primary underline hover:opacity-80">
                conditions générales de vente, d&apos;utilisation
              </Link>{' '}
              et la{' '}
              <Link href="/privacy" className="text-primary underline hover:opacity-80">
                politique de confidentialité
              </Link>
              .
            </span>
          </label>

          <div className="flex flex-col gap-3">
            <Link href="/checkout" onClick={() => dispatch({ type: 'CLEAR_LAST_ADDED' })}>
              <Button className="w-full">
                Procéder au paiement
              </Button>
            </Link>
            <Link
              href="/products"
              className="text-center text-sm text-primary underline hover:opacity-80"
              onClick={() => dispatch({ type: 'CLEAR_LAST_ADDED' })}
            >
              Continuer les achats
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
