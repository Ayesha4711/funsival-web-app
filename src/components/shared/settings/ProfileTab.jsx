"use client";

import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import {
  selectUser,
  fetchProfile,
  setProfile,
  updateUserProfile,
  updateProviderProfile,
  uploadProfilePicture,
} from "@/store/slices/profileSlice";
import {
  PHONE_COUNTRY_CODES,
  parsePhoneNumber,
  formatPhoneNumber,
  stripPhoneNumber,
  validatePhoneNumber,
} from "@/lib/phone";
import {
  UserIcon, MailIcon, PhoneIcon, MapPinIcon, BuildingIcon,
  CameraIcon, ChevronRightIcon, SpinnerIcon,
} from "@/icons";
import { AutoSaveNotice, SectionHeader, PhoneCountryPicker } from "./SettingsPrimitives";
import DatePickerField from "./DatePickerField";

const PROFILE_PICTURE_MAX_MB = 5;

const FIELD_LABELS = {
  firstName: "First Name", lastName: "Last Name", email: "Email Address",
  phoneNumber: "Phone Number", bio: "Bio", profileImage: "Profile Picture",
  addressLine1: "Address Line 1", addressLine2: "Address Line 2",
  dateOfBirth: "Date of Birth", state: "State", country: "Country", postalCode: "Postal Code",
  businessName: "Business Name", businessType: "Business Type",
};

export default function ProfileTab({ role, onChangePassword, onDeleteAccount }) {
  const dispatch = useDispatch();
  const profile = useSelector(selectUser);
  const hasLocalAuth = !Array.isArray(profile?.authProviders) || profile.authProviders.includes("local");

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phoneNumber: "", dateOfBirth: "",
    bio: "", profileImage: "", addressLine1: "", addressLine2: "",
    city: "", state: "", postalCode: "", country: "", businessName: "", businessType: "",
  });
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [initialized, setInitialized] = useState(false);
  const [phoneCountryCode, setPhoneCountryCode] = useState("+92");
  const fileInputRef = useRef(null);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [dirty, setDirty] = useState(false);

  const REQUIRED_FIELDS = role === "user"
    ? ["firstName", "lastName", "phoneNumber", "bio", "addressLine1", "state", "country", "postalCode"]
    : ["firstName", "lastName", "email", "phoneNumber", "bio", "profileImage", "addressLine1", "dateOfBirth", "state", "country", "postalCode", "businessName", "businessType"];

  useEffect(() => {
    if (!profile) dispatch(fetchProfile());
  }, [dispatch, profile]);

  useEffect(() => {
    if (profile && !initialized) {
      const pp  = profile.providerProfile ?? {};
      const loc = pp.location ?? {};
      const dob = pp.dateOfBirth ?? profile.dateOfBirth ?? "";
      const savedPhone = parsePhoneNumber(pp.phoneNumber ?? profile.phoneNumber ?? profile.phone ?? "");
      const nextForm = {
        firstName:    pp.firstName    ?? profile.firstName    ?? "",
        lastName:     pp.lastName     ?? profile.lastName     ?? "",
        email:        profile.email   ?? "",
        phoneNumber:  savedPhone.number,
        dateOfBirth:  dob ? dob.split("T")[0] : "",
        bio:          pp.bio          ?? profile.bio          ?? "",
        profileImage: pp.profileImage ?? profile.profileImage ?? "",
        addressLine1: loc.addressLine1 ?? profile.addressLine1 ?? "",
        addressLine2: loc.addressLine2 ?? profile.addressLine2 ?? "",
        city:         loc.city   ?? pp.city   ?? profile.city   ?? "",
        state:        loc.state  ?? pp.state  ?? profile.state  ?? "",
        postalCode:   loc.postalCode ?? pp.postalCode ?? profile.postalCode ?? "",
        country:      loc.country    ?? pp.country    ?? profile.country    ?? "",
        businessName: pp.businessName  ?? profile.businessName ?? profile.agencyName ?? "",
        businessType: pp.businessType  ?? profile.businessType ?? "",
      };
      const code = savedPhone.countryCode || "+92";
      const id = setTimeout(() => {
        setForm(nextForm);
        setProfileImageFile(null);
        setPhoneCountryCode(code);
        setInitialized(true);
        setDirty(false);
      }, 0);
      return () => clearTimeout(id);
    }
  }, [profile, initialized]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > PROFILE_PICTURE_MAX_MB * 1024 * 1024) {
      toast.error(`Profile picture must be ${PROFILE_PICTURE_MAX_MB}MB or smaller.`);
      e.target.value = "";
      return;
    }
    setProfileImageFile(file);
    setDirty(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm((f) => ({ ...f, profileImage: ev.target.result }));
      if (fieldErrors.profileImage) setFieldErrors((fe) => ({ ...fe, profileImage: undefined }));
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setDirty(true);
    if (fieldErrors[k]) setFieldErrors((fe) => ({ ...fe, [k]: undefined }));
  };

  const setPhoneNumber = (e) => {
    const digits = stripPhoneNumber(e.target.value).replace(/^0+/, "");
    if (digits.length > 15) return;
    setForm((f) => ({ ...f, phoneNumber: digits }));
    setDirty(true);
    if (fieldErrors.phoneNumber) setFieldErrors((fe) => ({ ...fe, phoneNumber: undefined }));
  };

  const setPhoneCode = (valueOrEvent) => {
    const next = typeof valueOrEvent === "string" ? valueOrEvent : valueOrEvent?.target?.value;
    if (!next) return;
    setPhoneCountryCode(next);
    setDirty(true);
    if (fieldErrors.phoneNumber) setFieldErrors((fe) => ({ ...fe, phoneNumber: undefined }));
  };

  const optionalText = (value) => value?.trim() ?? "";

  const handleSave = async () => {
    const localErrors = {};
    for (const key of REQUIRED_FIELDS) {
      if (!form[key]?.trim()) localErrors[key] = `${FIELD_LABELS[key]} is required.`;
    }
    if (Object.keys(localErrors).length > 0) {
      setFieldErrors(localErrors);
      toast.error("Please fill in all required fields.");
      return;
    }
    if (!phoneCountryCode) {
      setFieldErrors((fe) => ({ ...fe, phoneNumber: "Please select a country code." }));
      toast.error("Please select a country code.");
      return;
    }
    if (!validatePhoneNumber(form.phoneNumber, { allowLeadingZero: false })) {
      const digits = stripPhoneNumber(form.phoneNumber);
      const msg = digits.length > 15
        ? "Phone number cannot exceed 15 digits."
        : digits.startsWith("0")
          ? "Please enter the phone number without the leading 0."
          : "Please enter a valid phone number.";
      setFieldErrors((fe) => ({ ...fe, phoneNumber: msg }));
      toast.error(msg);
      return;
    }

    setSaving(true);
    try {
      let profileImage = form.profileImage;
      if (profileImageFile instanceof File) {
        const uploadResult = await dispatch(uploadProfilePicture(profileImageFile));
        if (uploadProfilePicture.rejected.match(uploadResult)) {
          const err = uploadResult.payload;
          throw new Error(typeof err === "string" ? err : err?.message || "Failed to upload profile picture.");
        }
        profileImage = uploadResult.payload;
      }

      const payload = {
        firstName: form.firstName, lastName: form.lastName,
        phoneNumber: formatPhoneNumber(phoneCountryCode, form.phoneNumber),
        dateOfBirth: form.dateOfBirth, bio: form.bio, profileImage,
        addressLine1: form.addressLine1, addressLine2: optionalText(form.addressLine2),
        city: form.city, state: form.state, postalCode: form.postalCode, country: form.country,
        ...(role !== "user" && { businessName: form.businessName, businessType: form.businessType }),
      };

      const isUser = role === "user";
      const thunk  = isUser ? updateUserProfile : updateProviderProfile;
      const result = await dispatch(thunk(payload));
      const ok = isUser
        ? updateUserProfile.fulfilled.match(result)
        : updateProviderProfile.fulfilled.match(result);

      if (ok) {
        const u = result.payload;
        const prov = u?.providerProfile ?? u;
        const loc  = prov?.location ?? u?.location ?? {};
        const sp   = parsePhoneNumber(prov?.phoneNumber ?? u?.phoneNumber ?? u?.phone ?? "");
        const img  = u?.profileImage ?? prov?.profileImage ?? profileImage;
        const dob  = u?.dateOfBirth  ?? prov?.dateOfBirth;
        setForm((prev) => ({
          ...prev,
          firstName:    u?.firstName   ?? prov?.firstName    ?? prev.firstName,
          lastName:     u?.lastName    ?? prov?.lastName     ?? prev.lastName,
          email:        u?.email       ?? prev.email,
          phoneNumber:  sp.number      || prev.phoneNumber,
          dateOfBirth:  dob ? dob.split("T")[0] : prev.dateOfBirth,
          bio:          u?.bio         ?? prov?.bio          ?? prev.bio,
          profileImage: img            ?? prev.profileImage,
          addressLine1: u?.addressLine1 ?? loc?.addressLine1 ?? prev.addressLine1,
          addressLine2: u?.addressLine2 ?? loc?.addressLine2 ?? prev.addressLine2,
          city:         u?.city        ?? loc?.city         ?? prev.city,
          state:        u?.state       ?? loc?.state        ?? prev.state,
          postalCode:   u?.postalCode  ?? loc?.postalCode   ?? prev.postalCode,
          country:      u?.country     ?? loc?.country      ?? prev.country,
          businessName: prov?.businessName ?? prev.businessName,
          businessType: prov?.businessType ?? prev.businessType,
        }));
        if (img) dispatch(setProfile({ ...profile, ...u, profileImage: img }));
        setProfileImageFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        setPhoneCountryCode(sp.countryCode || phoneCountryCode || "+92");
        toast.success("Profile updated successfully.");
        setFieldErrors({});
        setDirty(false);
      } else {
        const ep = result.payload;
        if (ep?.errors && typeof ep.errors === "object") {
          setFieldErrors(ep.errors);
          toast.error(Object.values(ep.errors)[0] || ep.message || "Validation failed.");
        } else {
          toast.error(ep?.message ?? (typeof ep === "string" ? ep : "Failed to update profile."));
        }
      }
    } catch (err) {
      toast.error(err?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const fullName = [form.firstName, form.lastName].filter(Boolean).join(" ") || "—";
  const initials = (form.firstName?.[0] ?? "") + (form.lastName?.[0] ?? "") || (role === "provider" ? "P" : "?");

  const field = (label, key, placeholder, icon, colSpan) => {
    const hasError  = !!fieldErrors[key];
    const isRequired = REQUIRED_FIELDS.includes(key);
    return (
      <div className={colSpan ? "sm:col-span-2" : ""} key={key}>
        <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-1.5">
          {icon && <span className="text-gray-400">{icon}</span>}
          {label}
          {isRequired && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <input
          type="text" placeholder={placeholder} value={form[key]} onChange={set(key)}
          className={`w-full border rounded-xl px-4 py-2.5 text-sm text-text placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
            hasError
              ? "border-red-400 focus:ring-red-200 focus:border-red-400"
              : "border-gray-200 focus:ring-primary/20 focus:border-primary"
          }`}
        />
        {hasError && <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors[key]}</p>}
      </div>
    );
  };

  const phoneField = () => {
    const hasError = !!fieldErrors.phoneNumber;
    return (
      <div>
        <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-1.5">
          <span className="text-gray-400"><PhoneIcon /></span>
          Phone Number <span className="text-red-500 ml-0.5">*</span>
        </label>
        <div className={`flex items-stretch overflow-visible rounded-xl border bg-white transition-colors focus-within:ring-2 ${
          hasError
            ? "border-red-400 focus-within:ring-red-200"
            : "border-gray-200 focus-within:ring-[var(--color-primary)]/20 focus-within:border-[var(--color-primary)]"
        }`}>
          <PhoneCountryPicker value={phoneCountryCode} onChange={setPhoneCode} />
          <input
            type="tel" placeholder="Enter phone number" maxLength={20}
            value={form.phoneNumber} onChange={setPhoneNumber}
            className="min-w-0 h-[42px] flex-1 rounded-r-xl px-4 py-2.5 text-sm text-[var(--color-text)] placeholder-gray-400 focus:outline-none"
          />
        </div>
        {hasError && <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.phoneNumber}</p>}
      </div>
    );
  };

  return (
    <div className="space-y-6 2xl:min-h-[calc(100vh-400px)]">
      <div className="bg-white rounded-2xl border border-gray-100 px-6 py-6 2xl:min-h-[600px]">
        <SectionHeader emoji="👤" title="Account Settings" subtitle="Manage your account details and security" />

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative shrink-0">
            <div className={`w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-white text-2xl font-bold overflow-hidden ring-2 ${fieldErrors.profileImage ? "ring-red-400" : "ring-transparent"}`}>
              {form.profileImage
                ? <img src={form.profileImage} alt="avatar" className="w-full h-full object-cover" />
                : initials.toUpperCase()}
            </div>
            <button type="button" onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white border-2 border-white hover:opacity-80 transition-opacity">
              <CameraIcon />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </div>
          <div>
            <p className="text-sm font-bold text-text">{fullName}</p>
            <p className="text-xs text-gray-400">{form.email || "—"}</p>
            <button type="button" onClick={() => fileInputRef.current?.click()}
              className="text-xs text-primary font-semibold mt-1 hover:underline">
              Change profile picture
            </button>
            <p className="mt-1 text-[11px] text-gray-400">JPG, PNG, or WEBP. Max size {PROFILE_PICTURE_MAX_MB}MB.</p>
            {fieldErrors.profileImage && (
              <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.profileImage}</p>
            )}
          </div>
        </div>

        {/* Personal Information */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-primary"><UserIcon size={16} /></span>
            <p className="text-sm font-bold text-text">Personal Information</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative">
            {field("First Name",    "firstName",   "John",                 null)}
            {field("Last Name",     "lastName",    "Doe",                  null)}
            {field("Email Address", "email",       "john.doe@example.com", <MailIcon />)}
            {phoneField()}
            <DatePickerField
              value={form.dateOfBirth}
              onChange={(v) => { setForm((f) => ({ ...f, dateOfBirth: v })); setDirty(true); if (fieldErrors.dateOfBirth) setFieldErrors((fe) => ({ ...fe, dateOfBirth: undefined })); }}
              hasError={!!fieldErrors.dateOfBirth}
              errorMsg={fieldErrors.dateOfBirth}
            />
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                Bio <span className="text-red-500">*</span>
              </label>
              <textarea rows={3} placeholder="Tell us about yourself..." value={form.bio} onChange={set("bio")}
                className={`w-full border rounded-xl px-4 py-2.5 text-sm text-text placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors resize-none ${
                  fieldErrors.bio
                    ? "border-red-400 focus:ring-red-200 focus:border-red-400"
                    : "border-gray-200 focus:ring-primary/20 focus:border-primary"
                }`}
              />
              {fieldErrors.bio && <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.bio}</p>}
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-primary"><MapPinIcon size={16} /></span>
            <p className="text-sm font-bold text-text">Location Information</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {field("Address Line 1", "addressLine1", "123 Main Street", null, true)}
            {field("Address Line 2", "addressLine2", "Suite 4B",        null, true)}
            {field("City",           "city",         "San Francisco",   null)}
            {field("State/Province", "state",        "California",      null)}
            {field("Zip/Postal Code","postalCode",   "94102",           null)}
            {field("Country",        "country",      "United States",   null)}
          </div>
        </div>

        {/* Provider info */}
        {role === "provider" && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-primary"><BuildingIcon size={16} /></span>
              <p className="text-sm font-bold text-text">Provider Information</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {field("Business Name", "businessName", "Adventure Hub",         null)}
              {field("Business Type", "businessType", "e.g. Event Management", null)}
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button onClick={handleSave} disabled={saving || !dirty}
            className="bg-primary hover:opacity-90 text-white font-semibold text-sm px-8 py-2.5 rounded-xl transition-opacity disabled:opacity-60 flex items-center gap-2">
            {saving && <SpinnerIcon size={14} />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Account settings card */}
      <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5">
        <p className="text-sm font-bold text-text mb-4">Account Settings</p>
        <div className="space-y-2">
          {hasLocalAuth ? (
            <button onClick={onChangePassword}
              className="w-full flex items-center gap-4 rounded-2xl border border-gray-200 px-5 py-4 hover:bg-gray-50 transition-colors text-left">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                <span className="text-xl">🔑</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text">Change password</p>
                <p className="text-xs text-gray-400">Update your account password</p>
              </div>
              <span className="text-gray-400 shrink-0"><ChevronRightIcon /></span>
            </button>
          ) : (
            <div className="w-full flex items-center gap-4 rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4">
              <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0">
                <span className="text-xl">🔒</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text">Signed up with Google</p>
                <p className="text-xs text-gray-400">Password login is not available for this account</p>
              </div>
            </div>
          )}
          <button onClick={onDeleteAccount}
            className="w-full flex items-center gap-4 rounded-2xl border border-red-100 bg-red-50/40 px-5 py-4 hover:bg-red-50 transition-colors text-left">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <span className="text-xl">🗑️</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-red-500">Delete account</p>
              <p className="text-xs text-gray-400">Permanently delete your account and data</p>
            </div>
            <span className="text-red-300 shrink-0"><ChevronRightIcon /></span>
          </button>
        </div>
      </div>

      <AutoSaveNotice />
    </div>
  );
}
