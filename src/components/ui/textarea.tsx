import * as React from 'react';

import { cn } from '@/lib/core/utils';

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return <textarea data-slot="textarea" className={cn('textarea-base', className)} {...props} />;
}

export { Textarea };
