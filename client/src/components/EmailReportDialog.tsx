import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface EmailReportDialogProps {
  reportContent: string;
  reportTitle: string;
  analysisType?: 'single' | 'comparison';
}

export function EmailReportDialog({ 
  reportContent, 
  reportTitle, 
  analysisType = 'single' 
}: EmailReportDialogProps) {
  const [email, setEmail] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const emailMutation = useMutation({
    mutationFn: async (emailAddress: string) => {
      const response = await apiRequest('POST', '/api/email-report', {
        recipientEmail: emailAddress,
        reportContent,
        reportTitle,
        analysisType
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Email sent successfully",
        description: "The report has been sent to your email address.",
      });
      setIsOpen(false);
      setEmail("");
    },
    onError: (error: any) => {
      console.error('Failed to send email:', error);
      toast({
        title: "Failed to send email",
        description: "There was a problem sending the report. Please check your email address and try again.",
        variant: "destructive",
      });
    }
  });

  const handleSendEmail = () => {
    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    emailMutation.mutate(email);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Mail className="w-4 h-4 mr-2" />
          Email Report
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Email Report</DialogTitle>
          <DialogDescription>
            Send this originality analysis report to your email address.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSendEmail();
                }
              }}
            />
          </div>
          <div className="text-sm text-muted-foreground">
            <p><strong>Report:</strong> {reportTitle}</p>
            <p><strong>Type:</strong> {analysisType === 'single' ? 'Single Passage Analysis' : 'Comparative Analysis'}</p>
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSendEmail}
            disabled={emailMutation.isPending}
          >
            {emailMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Email
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}