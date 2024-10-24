'use client'

import * as React from 'react'
import { type DialogProps } from '@radix-ui/react-dialog'
import { toast } from 'sonner'

import { ServerActionResult, type Query } from '@/lib/types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { IconSpinner } from '@/components/ui/icons'
import { useCopyToClipboard } from '@/lib/hooks/use-copy-to-clipboard'

interface QueryShareDialogProps extends DialogProps {
  query: Pick<Query, 'id' | 'question'>
  shareQuery: (id: string) => ServerActionResult<Query>
  onCopy: () => void
}

export function QueryShareDialog({
  query,
  shareQuery,
  onCopy,
  ...props
}: QueryShareDialogProps) {
  const { copyToClipboard } = useCopyToClipboard({ timeout: 1000 })
  const [isSharePending, startShareTransition] = React.useTransition()

  const copyShareLink = React.useCallback(
    async (query: Query) => {
      if (!query.sharePath) {
        return toast.error('Could not copy share link to clipboard')
      }

      const url = new URL(window.location.href)
      url.pathname = query.sharePath
      copyToClipboard(url.toString())
      onCopy()
      toast.success('Share link copied to clipboard')
    },
    [copyToClipboard, onCopy]
  )

  return (
    <Dialog {...props}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share link to query</DialogTitle>
          <DialogDescription>
            Anyone with the URL will be able to view the shared query.
          </DialogDescription>
        </DialogHeader>
        <div className="p-4 space-y-1 text-sm border rounded-md">
          <div className="font-medium">{query.question}</div>
        </div>
        <DialogFooter className="items-center">
          <Button
            disabled={isSharePending}
            onClick={() => {
              startShareTransition(async () => {
                const result = await shareQuery(query.id)

                if (result && 'error' in result) {
                  toast.error(result.error as string)
                  return
                }

                if (result) {
                  copyShareLink(result)
                } else {
                  toast.error('Failed to share query')
                }
              })
            }}
          >
            {isSharePending ? (
              <>
                <IconSpinner className="mr-2 animate-spin" />
                Copying...
              </>
            ) : (
              <>Copy link</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
