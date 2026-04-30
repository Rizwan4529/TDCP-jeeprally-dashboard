import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";

import {
  Checkbox,
  FormCommon,
  ImagePicker,
  Input,
  Select,
} from "@/components/common/FormCommon";
import { Typography } from "@/components/common/Typography";
import { cn } from "@/lib/utils";
import {
  stockPrepaidRegistrationSchema,
  type StockPrepaidRegistrationValues,
} from "@/utils/zodSchema";
import { Button } from "@/components/ui/button";

type RegistrationTab = {
  label: string;
  value: string;
};

const REGISTRATION_TABS: RegistrationTab[] = [
  { label: "Stock & Prepaid", value: "stock-prepaid" },
  { label: "Quad Bike", value: "quad-bike" },
  { label: "Dirt Bike", value: "dirt-bike" },
  { label: "4x4", value: "4x4" },
  { label: "Truck Race", value: "truck-race" },
];

const fieldClassName =
  "h-11 rounded-md border-[#D7DAE1] bg-white px-4 text-[15px] text-[#25314D] shadow-[0_1px_2px_rgba(15,23,42,0.05)] placeholder:text-[#8B96AD]";

const selectOptions = [
  { label: "Select", value: "select" },
  { label: "Option 1", value: "option-1" },
  { label: "Option 2", value: "option-2" },
];

const genderOptions = [
  { label: "select", value: "select" },
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
];

const defaultValues: StockPrepaidRegistrationValues = {
  categoryPreparedOne: false,
  categoryStock: false,
  categoryPreparedTwo: false,
  categoryPreparedThree: false,
  categoryFullName: "",
  personalFullName: "",
  personalGender: "",
  personalAge: "",
  personalAddress: "",
  personalCellNo: "",
  personalDrivingLicense: "",
  personalExpiryDate: "",
  personalCnicNo: "",
  personalEmail: "",
  driverImage: null,
  driverCnic: null,
  driverLicense: null,
  participatingCoDriver: false,
  participatingNavigator: false,
  coDriverFullName: "",
  coDriverGender: "",
  coDriverAge: "",
  coDriverCnicNo: "",
  coDriverEmail: "",
  coDriverCellNo: "",
  coDriverImage: null,
  coDriverCnic: null,
  vehicleRegistrationNo: "",
  vehicleMake: "",
  vehicleEngineCapacity: "",
  fuelDiesel: false,
  fuelPetrol: false,
  turboChargedYes: false,
  turboChargedNo: false,
  desiredRallyNumber: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  teamName: "",
  carName: "",
  participationCount: "",
  acceptedTerms: false,
};

function RequiredLabel({ children }: { children: string }) {
  return (
    <span>
      {children}
      <span className="text-[#E04444]"> *</span>
    </span>
  );
}

function RegistrationSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <Typography
        as="h3"
        variant="body-lg"
        className="text-[20px] leading-none text-[#4A4A4A]"
      >
        {title}
      </Typography>
      <div className="rounded-md bg-[#F9FAFD] p-8">{children}</div>
    </section>
  );
}

function FieldGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-x-9 gap-y-7 lg:grid-cols-3">
      {children}
    </div>
  );
}

function CompactFileField({
  control,
  name,
  label,
}: {
  control: ReturnType<
    typeof useForm<StockPrepaidRegistrationValues>
  >["control"];
  name: Parameters<
    typeof ImagePicker<StockPrepaidRegistrationValues>
  >[0]["name"];
  label: React.ReactNode;
}) {
  return (
    <ImagePicker
      control={control}
      name={name}
      label={label}
      variant="compact"
      helperText="Accepted file types: jpg, jpeg, png, gif."
      className="gap-2"
    />
  );
}

function StockPrepaidForm() {
  const form = useForm<StockPrepaidRegistrationValues>({
    resolver: zodResolver(stockPrepaidRegistrationSchema),
    defaultValues,
  });

  const onSubmit: SubmitHandler<StockPrepaidRegistrationValues> = (values) => {
    console.log("Stock & Prepaid registration", values);
  };

  return (
    <FormCommon form={form} onSubmit={onSubmit} className="space-y-8">
      <div className="rounded-md border border-[#E8E8E8] bg-white shadow-[0_8px_22px_rgba(15,23,42,0.04)]">
        <div className="border-b border-[#E8E8E8] px-8 py-6">
          <Typography
            as="h2"
            variant="h5"
            className="text-[20px] font-semibold uppercase leading-none text-[#4A4A4A]"
          >
            Registration
          </Typography>
        </div>

        <div className="space-y-8 p-8">
          <RegistrationSection title="Category">
            <div className="space-y-7">
              <div className="grid grid-cols-2 gap-7 lg:grid-cols-4">
                <Checkbox
                  control={form.control}
                  name="categoryPreparedOne"
                  label="Prepared"
                  showMessage={false}
                  checkboxClassName="size-6 border-[#CED4DF] bg-white"
                  itemClassName="items-center"
                />
                <Checkbox
                  control={form.control}
                  name="categoryStock"
                  label="Stock"
                  showMessage={false}
                  checkboxClassName="size-6 border-[#CED4DF] bg-white"
                  itemClassName="items-center"
                />
                <Checkbox
                  control={form.control}
                  name="categoryPreparedTwo"
                  label="Prepared"
                  showMessage={false}
                  checkboxClassName="size-6 border-[#CED4DF] bg-white"
                  itemClassName="items-center"
                />
                <Checkbox
                  control={form.control}
                  name="categoryPreparedThree"
                  label="Prepared"
                  showMessage={false}
                  checkboxClassName="size-6 border-[#CED4DF] bg-white"
                  itemClassName="items-center"
                />
              </div>

              <div className="grid grid-cols-1 gap-8 lg:grid-cols-[300px_1fr]">
                <Select
                  control={form.control}
                  name="categoryFullName"
                  label="Full name"
                  placeholder="Select"
                  options={selectOptions}
                  className={fieldClassName}
                  showMessage={false}
                />
                <div className="flex items-end pb-3">
                  <Typography
                    variant="body-sm"
                    className="max-w-[640px] text-[15px] leading-[1.45] text-[#25314D]"
                  >
                    Type(any other Sticker other than
                    team/club/association/manufactures will be considered
                    sponsored)
                  </Typography>
                </div>
              </div>
            </div>
          </RegistrationSection>

          <RegistrationSection title="Personal information">
            <FieldGrid>
              <Input
                control={form.control}
                name="personalFullName"
                label="Full name"
                placeholder="Select"
                className={fieldClassName}
              />
              <Select
                control={form.control}
                name="personalGender"
                label="Gender"
                placeholder="select"
                options={genderOptions}
                className={fieldClassName}
              />
              <Input
                control={form.control}
                name="personalAge"
                label="Age"
                placeholder="lorem ipsum"
                className={fieldClassName}
              />
              <Input
                control={form.control}
                name="personalAddress"
                label="Address"
                placeholder="address"
                className={fieldClassName}
              />
              <Input
                control={form.control}
                name="personalCellNo"
                label="cell no"
                placeholder="cell no"
                className={fieldClassName}
              />
              <Input
                control={form.control}
                name="personalDrivingLicense"
                label="Driving license"
                placeholder="345 56755 56"
                className={fieldClassName}
              />
              <Input
                control={form.control}
                name="personalExpiryDate"
                label="Expiry Date"
                placeholder="dd/mm/yyyy"
                className={fieldClassName}
              />
              <Input
                control={form.control}
                name="personalCnicNo"
                label={<RequiredLabel>CNIC No.</RequiredLabel>}
                placeholder="Select"
                className={fieldClassName}
              />
              <Input
                control={form.control}
                name="personalEmail"
                label="Email"
                placeholder="345 56755 56"
                className={fieldClassName}
              />
              <CompactFileField
                control={form.control}
                name="driverImage"
                label={<RequiredLabel>Driver's Image</RequiredLabel>}
              />
              <CompactFileField
                control={form.control}
                name="driverCnic"
                label={<RequiredLabel>Driver's CNIC</RequiredLabel>}
              />
              <CompactFileField
                control={form.control}
                name="driverLicense"
                label={<RequiredLabel>Driver's License</RequiredLabel>}
              />
            </FieldGrid>
          </RegistrationSection>

          <RegistrationSection title="Co-Driver /Navigator Information">
            <div className="space-y-7">
              <div className="space-y-2">
                <Typography variant="label" className="text-[#25314D]">
                  <RequiredLabel>Participating as</RequiredLabel>
                </Typography>
                <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:max-w-[520px]">
                  <Checkbox
                    control={form.control}
                    name="participatingCoDriver"
                    label="Co-Driver"
                    checkboxClassName="size-6 border-[#CED4DF] bg-white"
                    itemClassName="items-center"
                  />
                  <Checkbox
                    control={form.control}
                    name="participatingNavigator"
                    label="Navigator Information"
                    showMessage={false}
                    checkboxClassName="size-6 border-[#CED4DF] bg-white"
                    itemClassName="items-center"
                  />
                </div>
              </div>

              <FieldGrid>
                <Input
                  control={form.control}
                  name="coDriverFullName"
                  label="Full name"
                  placeholder="Select"
                  className={fieldClassName}
                />
                <Select
                  control={form.control}
                  name="coDriverGender"
                  label="Gender"
                  placeholder="select"
                  options={genderOptions}
                  className={fieldClassName}
                />
                <Input
                  control={form.control}
                  name="coDriverAge"
                  label="Age"
                  placeholder="lorem ipsum"
                  className={fieldClassName}
                />
                <Input
                  control={form.control}
                  name="coDriverCnicNo"
                  label={<RequiredLabel>CNIC No.</RequiredLabel>}
                  placeholder="Select"
                  className={fieldClassName}
                />
                <Input
                  control={form.control}
                  name="coDriverEmail"
                  label="Email"
                  placeholder="345 56755 56"
                  className={fieldClassName}
                />
                <Input
                  control={form.control}
                  name="coDriverCellNo"
                  label="cell no"
                  placeholder="cell no"
                  className={fieldClassName}
                />
                <CompactFileField
                  control={form.control}
                  name="coDriverImage"
                  label={
                    <RequiredLabel>Co-Driver /Navigator Image</RequiredLabel>
                  }
                />
                <CompactFileField
                  control={form.control}
                  name="coDriverCnic"
                  label={
                    <RequiredLabel>Co-Driver /Navigator CNIC</RequiredLabel>
                  }
                />
              </FieldGrid>
            </div>
          </RegistrationSection>

          <RegistrationSection title="Vehicle details">
            <div className="space-y-8">
              <FieldGrid>
                <Input
                  control={form.control}
                  name="vehicleRegistrationNo"
                  label="Registration No"
                  placeholder="Registration No"
                  className={fieldClassName}
                />
                <Input
                  control={form.control}
                  name="vehicleMake"
                  label={<RequiredLabel>Make</RequiredLabel>}
                  placeholder="Registration Nom"
                  className={fieldClassName}
                />
                <Input
                  control={form.control}
                  name="vehicleEngineCapacity"
                  label={<RequiredLabel>Engine Capacity</RequiredLabel>}
                  placeholder="capacity"
                  className={fieldClassName}
                />
              </FieldGrid>

              <div className="space-y-2">
                <Typography variant="label" className="text-[#25314D]">
                  <RequiredLabel>Please indicate with</RequiredLabel>
                </Typography>
                <div className="grid max-w-[500px] grid-cols-2 gap-8">
                  <Checkbox
                    control={form.control}
                    name="fuelDiesel"
                    label="Desiel"
                    checkboxClassName="size-6 border-[#CED4DF] bg-white"
                    itemClassName="items-center"
                  />
                  <Checkbox
                    control={form.control}
                    name="fuelPetrol"
                    label="Petrol"
                    showMessage={false}
                    checkboxClassName="size-6 border-[#CED4DF] bg-white"
                    itemClassName="items-center"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Typography variant="label" className="text-[#25314D]">
                  <RequiredLabel>Turbo Charged</RequiredLabel>
                </Typography>
                <div className="grid max-w-[500px] grid-cols-2 gap-8">
                  <Checkbox
                    control={form.control}
                    name="turboChargedYes"
                    label="Yes"
                    checkboxClassName="size-6 border-[#CED4DF] bg-white"
                    itemClassName="items-center"
                  />
                  <Checkbox
                    control={form.control}
                    name="turboChargedNo"
                    label="No"
                    showMessage={false}
                    checkboxClassName="size-6 border-[#CED4DF] bg-white"
                    itemClassName="items-center"
                  />
                </div>
              </div>

              <div className="max-w-[300px]">
                <Input
                  control={form.control}
                  name="desiredRallyNumber"
                  label="Desired Rally Number (Subject to Availability)"
                  placeholder="Registration No"
                  className={fieldClassName}
                />
              </div>
            </div>
          </RegistrationSection>

          <RegistrationSection title="Other Information">
            <FieldGrid>
              <Input
                control={form.control}
                name="emergencyContactName"
                label={
                  <RequiredLabel>
                    Person name to contact in Emergency
                  </RequiredLabel>
                }
                placeholder="Registration No"
                className={fieldClassName}
              />
              <Input
                control={form.control}
                name="emergencyContactPhone"
                label={
                  <RequiredLabel>
                    Person phone to contact in Emergency
                  </RequiredLabel>
                }
                placeholder="Registration Nom"
                className={fieldClassName}
              />
              <Input
                control={form.control}
                name="teamName"
                label="Team Name (if any)"
                placeholder="capacity"
                className={fieldClassName}
              />
              <Input
                control={form.control}
                name="carName"
                label="Car Name(if any)"
                placeholder="Registration No"
                className={fieldClassName}
              />
              <Input
                control={form.control}
                name="participationCount"
                label={
                  <RequiredLabel>
                    I am participating first time / number of time
                  </RequiredLabel>
                }
                placeholder="Registration Nom"
                className={fieldClassName}
              />
            </FieldGrid>
          </RegistrationSection>

          <RegistrationSection title="Undertaking">
            <div className="space-y-8">
              <Typography
                variant="body"
                className="max-w-[1100px] text-[15px] leading-[1.45] text-[#686868]"
              >
                ADD copy of Drivers License and ID Card (MANDATORY)
                <br />
                * Driver and Navigator Racing suit is MANDATORY.
                <br />
                Roll Bar of standardized specifications and Fire Extinguisher
                (Minm 04 KG) , four point harness seatbelts, & First Aid Kit are
                mandatory for all vehicles..
                <br />
                I/We being the entrant/s and /or driver and/or rider, certify
                that the particulars on the Entry Form are true and correct
              </Typography>

              <Checkbox
                control={form.control}
                name="acceptedTerms"
                label={
                  <RequiredLabel>
                    I agree to the Terms & Conditions.
                  </RequiredLabel>
                }
                checkboxClassName="size-6 border-[#CED4DF] bg-white"
                itemClassName="items-center"
              />
            </div>
          </RegistrationSection>
        </div>
      </div>

      <div className="flex items-center justify-end gap-4 pb-2">
          <Button
            type="button"
            variant="primary-outline"
            className="h-[46px] min-w-[150px] rounded-md px-8 text-[17px] font-medium"
            onClick={() => form.reset(defaultValues)}
          >
            <Typography as="span" variant="body" color="inherit">
              Cancel
            </Typography>
          </Button>
          <Button
            type="submit"
            className="h-[46px] min-w-[210px] rounded-md px-8 text-[17px] font-medium"
          >
            <Typography as="span" variant="body" color="inherit">
              Proceed To Payment
          </Typography>
        </Button>
      </div>
    </FormCommon>
  );
}

export default function RegistrationPage() {
  const [activeTab, setActiveTab] = useState("stock-prepaid");

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-7 xl:grid-cols-5">
        {REGISTRATION_TABS.map((tab) => {
          const isActive = tab.value === activeTab;

          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "h-[50px] rounded-md px-6 text-[18px] leading-none transition-colors",
                isActive
                  ? "bg-[#43AA72] text-white shadow-sm"
                  : "bg-[#F0F1F7] text-[#777777] hover:bg-[#E8EAF2]",
              )}
            >
              <Typography as="span" variant="body-lg" color="inherit">
                {tab.label}
              </Typography>
            </button>
          );
        })}
      </div>

      {activeTab === "stock-prepaid" ? (
        <StockPrepaidForm />
      ) : (
        <div className="rounded-md border border-[#E8E8E8] bg-white p-10 text-center shadow-[0_8px_22px_rgba(15,23,42,0.04)]">
          <Typography variant="body-lg" color="muted">
            This form will be made soon.
          </Typography>
        </div>
      )}
    </div>
  );
}
