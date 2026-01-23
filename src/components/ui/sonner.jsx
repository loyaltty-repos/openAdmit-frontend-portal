import { useTheme } from 'next-themes'
import { Toaster as Sonner } from 'sonner';
import { toast } from 'sonner'; // Import toast from sonner library

const Toaster = ({
  ...props
}) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)'
        }
      }
      {...props} />
  );
}

export { Toaster, toast } // Export both Toaster component and toast function
