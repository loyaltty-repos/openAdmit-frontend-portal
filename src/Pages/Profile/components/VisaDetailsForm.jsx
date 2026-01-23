import { useState, useEffect } from "react";
import PropTypes from "prop-types";
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
import Select from "react-select";

const VisaDetailsForm = ({ data, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [countries, setCountries] = useState([]);
  
  const form = useForm({
    defaultValues: {
      countriesPlanningToApply: data?.visa?.countriesPlanningToApply || [],
      visaInterviewDate: data?.visa?.visaInterviewDate ? new Date(data.visa.visaInterviewDate) : null,
      visaInterviewLocation: data?.visa?.visaInterviewLocation || "",
    },
  });

  useEffect(() => {
    // Create country options for the multi-select component
    const countryOptions = [
      { value: "USA", label: "USA" },
      { value: "Canada", label: "Canada" },
      { value: "UK", label: "UK" },
      { value: "Australia", label: "Australia" },
      { value: "Germany", label: "Germany" },
      { value: "France", label: "France" },
      { value: "New Zealand", label: "New Zealand" },
      { value: "Singapore", label: "Singapore" },
      { value: "Japan", label: "Japan" },
      { value: "South Korea", label: "South Korea" },
      { value: "Ireland", label: "Ireland" },
      { value: "Netherlands", label: "Netherlands" },
    ];
    
    setCountries(countryOptions);
  }, []);

  const onSubmit = async (values) => {
    try {
      setIsLoading(true);

      
      const countryValues = values.countriesPlanningToApply.map(country => country.value);

      const updateData = {
        visa: {
          countriesPlanningToApply: countryValues,
          visaInterviewDate: values.visaInterviewDate,
          visaInterviewLocation: values.visaInterviewLocation,
        },
      };

      const response = await updateUserProfile(updateData);
      
      if (response.status) {
        toast.success("Visa details updated successfully!");
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }
    } catch (error) {
      console.error("Error updating visa details:", error);
      toast.error(error?.response?.data?.message || "Error updating visa details");
    } finally {
      setIsLoading(false);
    }
  };

  // Transform the array of strings to array of objects for react-select
  const getDefaultCountries = () => {
    if (data?.visa?.countriesPlanningToApply && Array.isArray(data.visa.countriesPlanningToApply)) {
      return data.visa.countriesPlanningToApply.map(country => ({
        value: country,
        label: country
      }));
    }
    return [];
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="countriesPlanningToApply"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Countries Planning to Apply</FormLabel>
              <FormControl>
                <Select
                  isMulti
                  name="countries"
                  options={countries}
                  className="basic-multi-select"
                  classNamePrefix="select"
                  value={field.value}
                  defaultValue={getDefaultCountries()}
                  onChange={field.onChange}
                  placeholder="Select countries..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="visaInterviewDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Visa Interview Date</FormLabel>
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
          name="visaInterviewLocation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Visa Interview Location</FormLabel>
              <FormControl>
                <Input placeholder="Enter interview location" {...field} />
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
            {isLoading ? "Updating..." : "Update Visa Details"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

VisaDetailsForm.propTypes = {
  data: PropTypes.shape({
    visa: PropTypes.shape({
      countriesPlanningToApply: PropTypes.arrayOf(PropTypes.string),
      visaInterviewDate: PropTypes.string,
      visaInterviewLocation: PropTypes.string
    })
  }),
  onClose: PropTypes.func,
  onSuccess: PropTypes.func
};

VisaDetailsForm.defaultProps = {
  data: {
    visa: {
      countriesPlanningToApply: [],
      visaInterviewDate: null,
      visaInterviewLocation: ""
    }
  },
  onClose: () => {},
  onSuccess: () => {}
};

export default VisaDetailsForm;
