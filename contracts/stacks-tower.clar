;; Stacks Tower - add +1 to the onchain tower
;; Motto: Stack by stack.

(define-constant motto "Stack by stack.")

(define-data-var height uint u0)
(define-data-var last-stacker (optional principal) none)
(define-data-var last-stacked-at uint u0)

(define-public (stack)
  (begin
    (var-set height (+ (var-get height) u1))
    (var-set last-stacker (some tx-sender))
    (var-set last-stacked-at block-height)
    (print (tuple (stacker tx-sender) (height (var-get height)) (at block-height)))
    (ok (var-get height))
  )
)

(define-read-only (get-height)
  (ok (var-get height))
)

(define-read-only (get-last-stacker)
  (ok (var-get last-stacker))
)

(define-read-only (get-last-stacked-at)
  (ok (var-get last-stacked-at))
)
