import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { updateUserProfile } from "@/services/api.services";
import { toast } from "sonner";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const TOEFLDetailsForm = ({ data, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm({
    defaultValues: {
      toeflPlan: data?.toeflDetails?.toeflPlan ? new Date(data.toeflDetails.toeflPlan) : null,
      toeflDate: data?.toeflDetails?.toeflDate ? new Date(data.toeflDetails.toeflDate) : null,
      toeflReading: data?.toeflDetails?.toeflScore?.reading || "",
      toeflWriting: data?.toeflDetails?.toeflScore?.writing || "",
      toeflSpeaking: data?.toeflDetails?.toeflScore?.speaking || "",
      retakingTOEFL: data?.toeflDetails?.retakingTOEFL || "NO"
    },
  });

  const onSubmit = async (values) => {
    try {
      setIsLoading(true);

      const updateData = {
        toeflDetails: {
          toeflPlan: values.toeflPlan,
          toeflDate: values.toeflDate,
          toeflScore: {
            reading: values.toeflReading ? parseFloat(values.toeflReading) : null,
            writing: values.toeflWriting ? parseFloat(values.toeflWriting) : null,
            speaking: values.toeflSpeaking ? parseFloat(values.toeflSpeaking) : null,
          },
          retakingTOEFL: values.retakingTOEFL
        },
      };

      const response = await updateUserProfile(updateData);
      
      if (response.status) {
        toast.success("TOEFL details updated successfully!");
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }
    } catch (error) {
      console.error("Error updating TOEFL details:", error);
      toast.error(error?.response?.data?.message || "Error updating TOEFL details");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="toeflPlan"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>TOEFL Plan Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Select date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="toeflDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>TOEFL Test Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Select date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="toeflReading"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reading Score</FormLabel>
                <FormControl>
                  <Input type="number" min="0" max="30" placeholder="0-30" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="toeflWriting"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Writing Score</FormLabel>
                <FormControl>
                  <Input type="number" min="0" max="30" placeholder="0-30" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="toeflSpeaking"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Speaking Score</FormLabel>
                <FormControl>
                  <Input type="number" min="0" max="30" placeholder="0-30" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="retakingTOEFL"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Are you planning to retake the TOEFL?</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-row space-x-4"
                >
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="YES" />
                    </FormControl>
                    <FormLabel className="font-normal">Yes</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="NO" />
                    </FormControl>
                    <FormLabel className="font-normal">No</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Updating..." : "Update TOEFL Details"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TOEFLDetailsForm;