import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: 'group toast toast-base',
          description: 'toast-description',
          actionButton: 'toast-action',
          cancelButton: 'toast-cancel',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
