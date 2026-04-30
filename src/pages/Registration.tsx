import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useForm,
  type Control,
  type FieldPath,
  type FieldValues,
  type SubmitHandler,
} from "react-hook-form";

import {
  Checkbox,
  DatePicker,
  FormCommon,
  ImagePicker,
  Input,
  RadioGroup,
  Select,
} from "@/components/common/FormCommon";
import { Typography } from "@/components/common/Typography";
import { cn } from "@/lib/utils";
import {
  dirtBikeRegistrationSchema,
  quadBikeRegistrationSchema,
  sixBySixRegistrationSchema,
  stockPrepaidRegistrationSchema,
  truckRaceRegistrationSchema,
  type DirtBikeRegistrationValues,
  type QuadBikeRegistrationValues,
  type SixBySixRegistrationValues,
  type StockPrepaidRegistrationValues,
  type TruckRaceRegistrationValues,
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
  { label: "6x6", value: "six-by-six" },
  { label: "Truck Race", value: "truck-race" },
];

const fieldClassName =
  "h-11 w-full rounded-md border-[#D7DAE1] bg-white px-4 text-[15px] text-[#25314D] shadow-[0_1px_2px_rgba(15,23,42,0.05)] placeholder:text-[#8B96AD]";

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

const dirtBikeTypeOptions = [
  { label: "Individual", value: "individual" },
  { label: "Sponsored", value: "sponsored" },
];

const dirtBikeClassOptions = [
  { label: "Amature", value: "amature" },
  { label: "Pro", value: "pro" },
];

const participatingAsOptions = [
  { label: "Co-Driver", value: "co-driver" },
  { label: "Navigator Information", value: "navigator" },
];

const fuelTypeOptions = [
  { label: "Diesel", value: "diesel" },
  { label: "Petrol", value: "petrol" },
];

const yesNoOptions = [
  { label: "Yes", value: "yes" },
  { label: "No", value: "no" },
];

const stockPrepaidDefaultValues: StockPrepaidRegistrationValues = {
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

const dirtBikeDefaultValues: DirtBikeRegistrationValues = {
  categoryClass: "",
  categoryType: "individual",
  driverName: "",
  driverGender: "male",
  driverAge: "",
  driverAddress: "",
  driverCellNo: "",
  driverLicenseNo: "",
  driverExpiryDate: "",
  driverCnicNo: "",
  driverEmail: "",
  driverImage: null,
  driverCnic: null,
  driverLicense: null,
  bikeRegistrationNo: "",
  bikeMake: "",
  bikeEngineCapacity: "",
  desiredRallyNumber: "",
  emergencyContact: "",
  teamName: "",
  bikeName: "",
  participationCount: "",
  acceptedTerms: false,
};

const quadBikeDefaultValues: QuadBikeRegistrationValues = {
  categoryType: "individual",
  driverName: "",
  driverGender: "male",
  driverAge: "",
  driverAddress: "",
  driverCellNo: "",
  driverLicenseNo: "",
  driverExpiryDate: "",
  driverCnicNo: "",
  driverEmail: "",
  driverImage: null,
  driverCnic: null,
  driverLicense: null,
  bikeRegistrationNo: "",
  bikeMake: "",
  bikeEngineCapacity: "",
  desiredRallyNumber: "",
  emergencyContact: "",
  teamName: "",
  carName: "",
  participationCount: "",
  acceptedTerms: false,
};

const truckRaceDefaultValues: TruckRaceRegistrationValues = {
  categoryType: "individual",
  driverName: "",
  driverGender: "male",
  driverAge: "",
  driverAddress: "",
  driverCellNo: "",
  driverEmail: "",
  driverLicenseNo: "",
  driverExpiryDate: "",
  driverCnicNo: "",
  driverImage: null,
  driverCnic: null,
  driverLicense: null,
  coDriverParticipatingAs: "",
  coDriverName: "",
  coDriverSex: "male",
  coDriverAge: "",
  coDriverCnicNo: "",
  coDriverCellNo: "",
  coDriverLicenseNo: "",
  coDriverEmail: "",
  coDriverImage: null,
  coDriverCnic: null,
  coDriverLicense: null,
  mechanicName: "",
  mechanicSex: "male",
  mechanicAge: "",
  mechanicCnicNo: "",
  mechanicCellNo: "",
  vehicleRegistrationNo: "",
  vehicleMake: "",
  vehicleEngineCapacity: "",
  fuelType: "",
  turboCharged: "",
  desiredRallyNumber: "",
  emergencyContact: "",
  teamName: "",
  truckName: "",
  participationCount: "",
  acceptedTerms: false,
};

const sixBySixDefaultValues: SixBySixRegistrationValues = {
  ...truckRaceDefaultValues,
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
    <section className="space-y-3 sm:space-y-4">
      <Typography
        as="h3"
        variant="body-lg"
        className="text-[18px] leading-none text-[#4A4A4A] sm:text-[20px]"
      >
        {title}
      </Typography>
      <div className="rounded-md bg-[#F9FAFD] p-4 sm:p-6 lg:p-8">
        {children}
      </div>
    </section>
  );
}

function FieldGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-3 lg:gap-x-9 lg:gap-y-7">
      {children}
    </div>
  );
}

function CompactFileField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
}: {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
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
    defaultValues: stockPrepaidDefaultValues,
  });

  const onSubmit: SubmitHandler<StockPrepaidRegistrationValues> = (values) => {
    console.log("Stock & Prepaid registration", values);
  };

  return (
    <FormCommon
      form={form}
      onSubmit={onSubmit}
      className="space-y-5 sm:space-y-8"
    >
      <div className="rounded-md border border-[#E8E8E8] bg-white shadow-[0_8px_22px_rgba(15,23,42,0.04)]">
        <div className="border-b border-[#E8E8E8] px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
          <Typography
            as="h2"
            variant="h5"
            className="text-[18px] font-semibold uppercase leading-none text-[#4A4A4A] sm:text-[20px]"
          >
            Registration
          </Typography>
        </div>

        <div className="space-y-6 p-4 sm:p-6 lg:space-y-8 lg:p-8">
          <RegistrationSection title="Category">
            <div className="space-y-5 lg:space-y-7">
              <div className="grid grid-cols-1 gap-4 min-[380px]:grid-cols-2 sm:grid-cols-4 lg:gap-7">
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

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-[300px_1fr] lg:gap-8">
                <Select
                  control={form.control}
                  name="categoryFullName"
                  label="Full name"
                  placeholder="Select"
                  options={selectOptions}
                  className={fieldClassName}
                  showMessage={false}
                />
                <div className="flex items-end lg:pb-3">
                  <Typography
                    variant="body-sm"
                    className="max-w-[640px] text-[14px] leading-[1.45] text-[#25314D] sm:text-[15px]"
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
              <DatePicker
                control={form.control}
                name="personalExpiryDate"
                label="Expiry Date"
                placeholder="mm/dd/yyyy"
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
            <div className="space-y-5 lg:space-y-7">
              <div className="space-y-2">
                <Typography variant="label" className="text-[#25314D]">
                  <RequiredLabel>Participating as</RequiredLabel>
                </Typography>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:max-w-[520px] lg:gap-7">
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
            <div className="space-y-6 lg:space-y-8">
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
                <div className="grid max-w-[500px] grid-cols-1 gap-4 min-[380px]:grid-cols-2 sm:gap-8">
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
                <div className="grid max-w-[500px] grid-cols-1 gap-4 min-[380px]:grid-cols-2 sm:gap-8">
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

              <div className="max-w-none sm:max-w-[300px]">
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
            <div className="space-y-6 sm:space-y-8">
              <Typography
                variant="body"
                className="max-w-[1100px] text-[14px] leading-[1.45] text-[#686868] sm:text-[15px]"
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

      <div className="flex flex-col-reverse items-stretch justify-end gap-3 pb-2 sm:flex-row sm:items-center sm:gap-4">
        <Button
          type="button"
          variant="primary-outline"
          className="h-[46px] w-full rounded-md px-8 text-[16px] font-medium sm:w-auto sm:min-w-[150px] sm:text-[17px]"
          onClick={() => form.reset(stockPrepaidDefaultValues)}
        >
          <Typography as="span" variant="body" color="inherit">
            Cancel
          </Typography>
        </Button>
        <Button
          type="submit"
          className="h-[46px] w-full rounded-md px-6 text-[16px] font-medium sm:w-auto sm:min-w-[210px] sm:px-8 sm:text-[17px]"
        >
          <Typography as="span" variant="body" color="inherit">
            Proceed To Payment
          </Typography>
        </Button>
      </div>
    </FormCommon>
  );
}

function DirtBikeForm() {
  const form = useForm<DirtBikeRegistrationValues>({
    resolver: zodResolver(dirtBikeRegistrationSchema),
    defaultValues: dirtBikeDefaultValues,
  });

  const onSubmit: SubmitHandler<DirtBikeRegistrationValues> = (values) => {
    console.log("Dirt Bike registration", values);
  };

  return (
    <FormCommon
      form={form}
      onSubmit={onSubmit}
      className="space-y-5 sm:space-y-8"
    >
      <div className="rounded-md border border-[#E8E8E8] bg-white shadow-[0_8px_22px_rgba(15,23,42,0.04)]">
        <div className="border-b border-[#E8E8E8] px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
          <Typography
            as="h2"
            variant="h5"
            className="text-[18px] font-semibold uppercase leading-none text-[#4A4A4A] sm:text-[20px]"
          >
            Registration
          </Typography>
        </div>

        <div className="space-y-6 p-4 sm:p-6 lg:space-y-8 lg:p-8">
          <RegistrationSection title="Category">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-3 lg:gap-x-9 lg:gap-y-7">
              <RadioGroup
                control={form.control}
                name="categoryClass"
                label={<RequiredLabel>Class</RequiredLabel>}
                options={dirtBikeClassOptions}
                className="flex flex-wrap gap-6 pt-1"
              />
              <Select
                control={form.control}
                name="categoryType"
                label={<RequiredLabel>Type</RequiredLabel>}
                placeholder="Individual"
                options={dirtBikeTypeOptions}
                className={fieldClassName}
              />
            </div>
          </RegistrationSection>

          <RegistrationSection title="Driver Information">
            <FieldGrid>
              <Input
                control={form.control}
                name="driverName"
                label={<RequiredLabel>Name</RequiredLabel>}
                className={fieldClassName}
              />
              <Select
                control={form.control}
                name="driverGender"
                label={<RequiredLabel>Gender</RequiredLabel>}
                placeholder="Male"
                options={genderOptions}
                className={fieldClassName}
              />
              <Input
                control={form.control}
                name="driverAge"
                label="Age"
                type="number"
                className={fieldClassName}
              />
              <Input
                control={form.control}
                name="driverAddress"
                label="Address"
                className={fieldClassName}
              />
              <Input
                control={form.control}
                name="driverCellNo"
                label={<RequiredLabel>Cell No (Whats App)</RequiredLabel>}
                className={fieldClassName}
              />
              <Input
                control={form.control}
                name="driverLicenseNo"
                label={<RequiredLabel>Driving License No</RequiredLabel>}
                className={fieldClassName}
              />
              <DatePicker
                control={form.control}
                name="driverExpiryDate"
                label="Expiry Date"
                placeholder="mm/dd/yyyy"
                className={fieldClassName}
              />
              <Input
                control={form.control}
                name="driverCnicNo"
                label={<RequiredLabel>CNIC No.</RequiredLabel>}
                className={fieldClassName}
              />
              <Input
                control={form.control}
                name="driverEmail"
                label={<RequiredLabel>Email</RequiredLabel>}
                type="email"
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

          <RegistrationSection title="Bike Information">
            <FieldGrid>
              <Input
                control={form.control}
                name="bikeRegistrationNo"
                label="Registration No"
                className={fieldClassName}
              />
              <Input
                control={form.control}
                name="bikeMake"
                label={<RequiredLabel>Make</RequiredLabel>}
                className={fieldClassName}
              />
              <Input
                control={form.control}
                name="bikeEngineCapacity"
                label={<RequiredLabel>Engine Capacity</RequiredLabel>}
                className={fieldClassName}
              />
              <Input
                control={form.control}
                name="desiredRallyNumber"
                label={
                  <RequiredLabel>
                    Desired Rally Number (Subject to Availability)
                  </RequiredLabel>
                }
                className={fieldClassName}
                itemClassName="lg:col-span-3"
              />
            </FieldGrid>
          </RegistrationSection>

          <RegistrationSection title="Other Information">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2 lg:gap-x-9 lg:gap-y-7">
              <Input
                control={form.control}
                name="emergencyContact"
                label={
                  <RequiredLabel>
                    Person to contact in case of Emergency & Phone No
                  </RequiredLabel>
                }
                className={fieldClassName}
              />
              <Input
                control={form.control}
                name="teamName"
                label="Team Name (if any)"
                className={fieldClassName}
              />
              <Input
                control={form.control}
                name="bikeName"
                label="Bike Name(if any)"
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
                className={fieldClassName}
              />
            </div>
          </RegistrationSection>

          <RegistrationSection title="Undertaking">
            <div className="space-y-6 sm:space-y-8">
              <Typography
                variant="body"
                className="max-w-[1100px] text-[14px] leading-[1.45] text-[#686868] sm:text-[15px]"
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

      <div className="flex flex-col-reverse items-stretch justify-end gap-3 pb-2 sm:flex-row sm:items-center sm:gap-4">
        <Button
          type="button"
          variant="primary-outline"
          className="h-[46px] w-full rounded-md px-8 text-[16px] font-medium sm:w-auto sm:min-w-[150px] sm:text-[17px]"
          onClick={() => form.reset(dirtBikeDefaultValues)}
        >
          <Typography as="span" variant="body" color="inherit">
            Cancel
          </Typography>
        </Button>
        <Button
          type="submit"
          className="h-[46px] w-full rounded-md px-6 text-[16px] font-medium sm:w-auto sm:min-w-[210px] sm:px-8 sm:text-[17px]"
        >
          <Typography as="span" variant="body" color="inherit">
            Proceed To Payment
          </Typography>
        </Button>
      </div>
    </FormCommon>
  );
}

function QuadBikeForm() {
  const form = useForm<QuadBikeRegistrationValues>({
    resolver: zodResolver(quadBikeRegistrationSchema),
    defaultValues: quadBikeDefaultValues,
  });

  const onSubmit: SubmitHandler<QuadBikeRegistrationValues> = (values) => {
    console.log("Quad Bike registration", values);
  };

  return (
    <FormCommon
      form={form}
      onSubmit={onSubmit}
      className="space-y-5 sm:space-y-8"
    >
      <div className="rounded-md border border-[#E8E8E8] bg-white shadow-[0_8px_22px_rgba(15,23,42,0.04)]">
        <div className="border-b border-[#E8E8E8] px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
          <Typography
            as="h2"
            variant="h5"
            className="text-[18px] font-semibold uppercase leading-none text-[#4A4A4A] sm:text-[20px]"
          >
            Registration
          </Typography>
        </div>

        <div className="space-y-6 p-4 sm:p-6 lg:space-y-8 lg:p-8">
          <RegistrationSection title="Category">
            <FieldGrid>
              <Select
                control={form.control}
                name="categoryType"
                label={<RequiredLabel>Type</RequiredLabel>}
                placeholder="Individual"
                options={dirtBikeTypeOptions}
                className={fieldClassName}
              />
            </FieldGrid>
          </RegistrationSection>

          <RegistrationSection title="Driver Information">
            <FieldGrid>
              <Input
                control={form.control}
                name="driverName"
                label={<RequiredLabel>Name</RequiredLabel>}
                className={fieldClassName}
              />
              <Select
                control={form.control}
                name="driverGender"
                label={<RequiredLabel>Gender</RequiredLabel>}
                placeholder="Male"
                options={genderOptions}
                className={fieldClassName}
              />
              <Input
                control={form.control}
                name="driverAge"
                label="Age"
                type="number"
                className={fieldClassName}
              />
              <Input
                control={form.control}
                name="driverAddress"
                label="Address"
                className={fieldClassName}
              />
              <Input
                control={form.control}
                name="driverCellNo"
                label={<RequiredLabel>Cell No (Whats App)</RequiredLabel>}
                className={fieldClassName}
              />
              <Input
                control={form.control}
                name="driverLicenseNo"
                label={<RequiredLabel>Driving License No</RequiredLabel>}
                className={fieldClassName}
              />
              <DatePicker
                control={form.control}
                name="driverExpiryDate"
                label="Expiry Date"
                placeholder="mm/dd/yyyy"
                className={fieldClassName}
              />
              <Input
                control={form.control}
                name="driverCnicNo"
                label={<RequiredLabel>CNIC No.</RequiredLabel>}
                className={fieldClassName}
              />
              <Input
                control={form.control}
                name="driverEmail"
                label={<RequiredLabel>Email</RequiredLabel>}
                type="email"
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

          <RegistrationSection title="Bike Information">
            <FieldGrid>
              <Input
                control={form.control}
                name="bikeRegistrationNo"
                label="Registration No"
                className={fieldClassName}
              />
              <Input
                control={form.control}
                name="bikeMake"
                label={<RequiredLabel>Make</RequiredLabel>}
                className={fieldClassName}
              />
              <Input
                control={form.control}
                name="bikeEngineCapacity"
                label={<RequiredLabel>Engine Capacity</RequiredLabel>}
                className={fieldClassName}
              />
              <Input
                control={form.control}
                name="desiredRallyNumber"
                label={
                  <RequiredLabel>
                    Desired Rally Number (Subject to Availability)
                  </RequiredLabel>
                }
                className={fieldClassName}
                itemClassName="lg:col-span-3"
              />
            </FieldGrid>
          </RegistrationSection>

          <RegistrationSection title="Other Information">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2 lg:gap-x-9 lg:gap-y-7">
              <Input
                control={form.control}
                name="emergencyContact"
                label={
                  <RequiredLabel>
                    Person to contact in case of Emergency & Phone No
                  </RequiredLabel>
                }
                className={fieldClassName}
              />
              <Input
                control={form.control}
                name="teamName"
                label="Team Name (if any)"
                className={fieldClassName}
              />
              <Input
                control={form.control}
                name="carName"
                label="Car Name(if any)"
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
                className={fieldClassName}
              />
            </div>
          </RegistrationSection>

          <RegistrationSection title="Undertaking">
            <div className="space-y-6 sm:space-y-8">
              <Typography
                variant="body"
                className="max-w-[1100px] text-[14px] leading-[1.45] text-[#686868] sm:text-[15px]"
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

      <div className="flex flex-col-reverse items-stretch justify-end gap-3 pb-2 sm:flex-row sm:items-center sm:gap-4">
        <Button
          type="button"
          variant="primary-outline"
          className="h-[46px] w-full rounded-md px-8 text-[16px] font-medium sm:w-auto sm:min-w-[150px] sm:text-[17px]"
          onClick={() => form.reset(quadBikeDefaultValues)}
        >
          <Typography as="span" variant="body" color="inherit">
            Cancel
          </Typography>
        </Button>
        <Button
          type="submit"
          className="h-[46px] w-full rounded-md px-6 text-[16px] font-medium sm:w-auto sm:min-w-[210px] sm:px-8 sm:text-[17px]"
        >
          <Typography as="span" variant="body" color="inherit">
            Proceed To Payment
          </Typography>
        </Button>
      </div>
    </FormCommon>
  );
}

function TruckRaceForm({
  defaultValues = truckRaceDefaultValues,
  formSchema = truckRaceRegistrationSchema,
  submitLabel = "Truck Race registration",
}: {
  defaultValues?: TruckRaceRegistrationValues;
  formSchema?: typeof truckRaceRegistrationSchema;
  submitLabel?: string;
}) {
  const form = useForm<TruckRaceRegistrationValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit: SubmitHandler<TruckRaceRegistrationValues> = (values) => {
    console.log(submitLabel, values);
  };

  return (
    <FormCommon form={form} onSubmit={onSubmit} className="space-y-5 sm:space-y-8">
      <div className="rounded-md border border-[#E8E8E8] bg-white shadow-[0_8px_22px_rgba(15,23,42,0.04)]">
        <div className="border-b border-[#E8E8E8] px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
          <Typography
            as="h2"
            variant="h5"
            className="text-[18px] font-semibold uppercase leading-none text-[#4A4A4A] sm:text-[20px]"
          >
            Registration
          </Typography>
        </div>

        <div className="space-y-6 p-4 sm:p-6 lg:space-y-8 lg:p-8">
          <RegistrationSection title="Category">
            <Select
              control={form.control}
              name="categoryType"
              label={<RequiredLabel>Type</RequiredLabel>}
              placeholder="Individual"
              options={dirtBikeTypeOptions}
              className={fieldClassName}
              itemClassName="max-w-[560px]"
            />
          </RegistrationSection>

          <RegistrationSection title="Driver Information">
            <FieldGrid>
              <Input
                control={form.control}
                name="driverName"
                label={<RequiredLabel>Name</RequiredLabel>}
                className={fieldClassName}
              />
              <Select
                control={form.control}
                name="driverGender"
                label={<RequiredLabel>Gender</RequiredLabel>}
                placeholder="Male"
                options={genderOptions}
                className={fieldClassName}
              />
              <Input
                control={form.control}
                name="driverAge"
                label="Age"
                type="number"
                className={fieldClassName}
              />
              <Input
                control={form.control}
                name="driverAddress"
                label="Address"
                className={fieldClassName}
              />
              <Input
                control={form.control}
                name="driverCellNo"
                label={<RequiredLabel>Cell No (Whats App)</RequiredLabel>}
                className={fieldClassName}
              />
              <Input
                control={form.control}
                name="driverEmail"
                label={<RequiredLabel>Email</RequiredLabel>}
                type="email"
                className={fieldClassName}
              />
              <Input
                control={form.control}
                name="driverLicenseNo"
                label={<RequiredLabel>Driving License No</RequiredLabel>}
                className={fieldClassName}
              />
              <DatePicker
                control={form.control}
                name="driverExpiryDate"
                label="Expiry Date"
                placeholder="mm/dd/yyyy"
                className={fieldClassName}
              />
              <Input
                control={form.control}
                name="driverCnicNo"
                label={<RequiredLabel>CNIC No.</RequiredLabel>}
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
            <div className="space-y-6">
              <RadioGroup
                control={form.control}
                name="coDriverParticipatingAs"
                label={<RequiredLabel>Participating as</RequiredLabel>}
                options={participatingAsOptions}
                className="flex flex-wrap gap-6 pt-1"
              />
              <FieldGrid>
                <Input
                  control={form.control}
                  name="coDriverName"
                  label={<RequiredLabel>Name</RequiredLabel>}
                  className={fieldClassName}
                />
                <Select
                  control={form.control}
                  name="coDriverSex"
                  label="SEX"
                  placeholder="Male"
                  options={genderOptions}
                  className={fieldClassName}
                />
                <Input
                  control={form.control}
                  name="coDriverAge"
                  label="Age"
                  type="number"
                  className={fieldClassName}
                />
                <Input
                  control={form.control}
                  name="coDriverCnicNo"
                  label={<RequiredLabel>CNIC No.</RequiredLabel>}
                  className={fieldClassName}
                />
                <Input
                  control={form.control}
                  name="coDriverCellNo"
                  label={<RequiredLabel>Cell (WhatsApp)</RequiredLabel>}
                  className={fieldClassName}
                />
                <Input
                  control={form.control}
                  name="coDriverLicenseNo"
                  label={
                    <RequiredLabel>
                      DrivingLicenseNo(in case of co Driver)
                    </RequiredLabel>
                  }
                  className={fieldClassName}
                />
                <Input
                  control={form.control}
                  name="coDriverEmail"
                  label={<RequiredLabel>Email</RequiredLabel>}
                  type="email"
                  className={fieldClassName}
                />
                <CompactFileField
                  control={form.control}
                  name="coDriverImage"
                  label={<RequiredLabel>Co-Driver /Navigator Image</RequiredLabel>}
                />
                <CompactFileField
                  control={form.control}
                  name="coDriverCnic"
                  label={<RequiredLabel>Co-Driver /Navigator CNIC</RequiredLabel>}
                />
                <CompactFileField
                  control={form.control}
                  name="coDriverLicense"
                  label={<RequiredLabel>Co-Driver License</RequiredLabel>}
                />
              </FieldGrid>
            </div>
          </RegistrationSection>

          <RegistrationSection title="Mechanic Information">
            <FieldGrid>
              <Input
                control={form.control}
                name="mechanicName"
                label={<RequiredLabel>Name</RequiredLabel>}
                className={fieldClassName}
              />
              <Select
                control={form.control}
                name="mechanicSex"
                label="SEX"
                placeholder="Male"
                options={genderOptions}
                className={fieldClassName}
              />
              <Input
                control={form.control}
                name="mechanicAge"
                label="Age"
                type="number"
                className={fieldClassName}
              />
              <Input
                control={form.control}
                name="mechanicCnicNo"
                label={<RequiredLabel>CNIC No.</RequiredLabel>}
                className={fieldClassName}
              />
              <Input
                control={form.control}
                name="mechanicCellNo"
                label={<RequiredLabel>Cell (WhatsApp)</RequiredLabel>}
                className={fieldClassName}
              />
            </FieldGrid>
          </RegistrationSection>

          <RegistrationSection title="Vehicle Information">
            <FieldGrid>
              <Input
                control={form.control}
                name="vehicleRegistrationNo"
                label="Registration No"
                className={fieldClassName}
              />
              <Input
                control={form.control}
                name="vehicleMake"
                label={<RequiredLabel>Make</RequiredLabel>}
                className={fieldClassName}
              />
              <Input
                control={form.control}
                name="vehicleEngineCapacity"
                label={<RequiredLabel>Engine Capacity</RequiredLabel>}
                className={fieldClassName}
              />
              <RadioGroup
                control={form.control}
                name="fuelType"
                label={<RequiredLabel>Please indicate with</RequiredLabel>}
                options={fuelTypeOptions}
                className="flex flex-wrap gap-6 pt-1"
              />
              <RadioGroup
                control={form.control}
                name="turboCharged"
                label={<RequiredLabel>Turbo Charged</RequiredLabel>}
                options={yesNoOptions}
                className="flex flex-wrap gap-6 pt-1"
              />
              <Input
                control={form.control}
                name="desiredRallyNumber"
                label={
                  <RequiredLabel>
                    Desired Rally Number (Subject to Availability)
                  </RequiredLabel>
                }
                className={fieldClassName}
              />
            </FieldGrid>
          </RegistrationSection>

          <RegistrationSection title="Other Information">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2 lg:gap-x-9 lg:gap-y-7">
              <Input
                control={form.control}
                name="emergencyContact"
                label={
                  <RequiredLabel>
                    Person to contact in case of Emergency & Phone No
                  </RequiredLabel>
                }
                className={fieldClassName}
              />
              <Input
                control={form.control}
                name="teamName"
                label="Team Name (if any)"
                className={fieldClassName}
              />
              <Input
                control={form.control}
                name="truckName"
                label="Truck Name(if any)"
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
                className={fieldClassName}
              />
            </div>
          </RegistrationSection>

          <RegistrationSection title="Undertaking">
            <div className="space-y-6 sm:space-y-8">
              <Typography
                variant="body"
                className="max-w-[1100px] text-[14px] leading-[1.45] text-[#686868] sm:text-[15px]"
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

      <div className="flex flex-col-reverse items-stretch justify-end gap-3 pb-2 sm:flex-row sm:items-center sm:gap-4">
        <Button
          type="button"
          variant="primary-outline"
          className="h-[46px] w-full rounded-md px-8 text-[16px] font-medium sm:w-auto sm:min-w-[150px] sm:text-[17px]"
          onClick={() => form.reset(defaultValues)}
        >
          <Typography as="span" variant="body" color="inherit">
            Cancel
          </Typography>
        </Button>
        <Button
          type="submit"
          className="h-[46px] w-full rounded-md px-6 text-[16px] font-medium sm:w-auto sm:min-w-[210px] sm:px-8 sm:text-[17px]"
        >
          <Typography as="span" variant="body" color="inherit">
            Proceed To Payment
          </Typography>
        </Button>
      </div>
    </FormCommon>
  );
}

function SixBySixForm() {
  return (
    <TruckRaceForm
      defaultValues={sixBySixDefaultValues}
      formSchema={sixBySixRegistrationSchema}
      submitLabel="6x6 registration"
    />
  );
}

export default function RegistrationPage() {
  const [activeTab, setActiveTab] = useState("stock-prepaid");

  return (
    <div className="space-y-5 sm:space-y-8">
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-5">
        {REGISTRATION_TABS.map((tab) => {
          const isActive = tab.value === activeTab;

          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "flex h-12 min-w-0 items-center justify-center rounded-md px-2 transition-colors sm:h-[50px] sm:px-4 lg:px-6",
                isActive
                  ? "bg-[#43AA72] text-white shadow-sm"
                  : "bg-[#F0F1F7] text-[#777777] hover:bg-[#E8EAF2]",
              )}
            >
              <Typography
                as="span"
                variant="body-lg"
                color="inherit"
                className="block max-w-full truncate text-[14px] leading-none sm:text-[16px] lg:text-[18px]"
              >
                {tab.label}
              </Typography>
            </button>
          );
        })}
      </div>

      {activeTab === "stock-prepaid" ? (
        <StockPrepaidForm />
      ) : activeTab === "quad-bike" ? (
        <QuadBikeForm />
      ) : activeTab === "dirt-bike" ? (
        <DirtBikeForm />
      ) : activeTab === "six-by-six" ? (
        <SixBySixForm />
      ) : activeTab === "truck-race" ? (
        <TruckRaceForm />
      ) : (
        <div className="rounded-md border border-[#E8E8E8] bg-white p-6 text-center shadow-[0_8px_22px_rgba(15,23,42,0.04)] sm:p-10">
          <Typography variant="body-lg" color="muted">
            This form will be made soon.
          </Typography>
        </div>
      )}
    </div>
  );
}
