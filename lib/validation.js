const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const urlRe = /^https?:\/\/.+/i;
const phoneRe = /^[\d\+\-\s\(\)]{7,20}$/;
const slugRe = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const numericRe = /^\d+$/;
const alphanumericRe = /^[a-zA-Z0-9]+$/;
const youtubeRe = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/i;
const vimeoRe = /^(https?:\/\/)?(www\.)?vimeo\.com\/.+/i;
const linkedinRe = /^(https?:\/\/)?(www\.)?linkedin\.com\/.+/i;
const xRe = /^(https?:\/\/)?(www\.)?(x\.com|x\.com)\/.+/i;
const facebookRe = /^(https?:\/\/)?(www\.)?facebook\.com\/.+/i;
const instagramRe = /^(https?:\/\/)?(www\.)?instagram\.com\/.+/i;
const tiktokRe = /^(https?:\/\/)?(www\.)?tiktok\.com\/.+/i;
const githubRe = /^(https?:\/\/)?(www\.)?github\.com\/.+/i;

const messages = {
  email: "Enter a valid email address",
  url: "Enter a valid URL (must start with http:// or https://)",
  phone: "Enter a valid phone number",
  slug: "Must be lowercase with hyphens (e.g. my-slug)",
  required: "This field is required",
  notEmpty: "This field is required",
  youtubeUrl: "Enter a valid YouTube URL",
  vimeoUrl: "Enter a valid Vimeo URL",
  linkedinUrl: "Enter a valid LinkedIn URL",
  xUrl: "Enter a valid X/X URL",
  facebookUrl: "Enter a valid Facebook URL",
  instagramUrl: "Enter a valid Instagram URL",
  tiktokUrl: "Enter a valid TikTok URL",
  githubUrl: "Enter a valid GitHub URL",
  password: "Must be at least 6 characters",
  numeric: "Must contain only digits",
  alphanumeric: "Must contain only letters and numbers",
  minLength: "Value is too short",
  maxLength: "Value is too long",
};

export function validate(value, type, length) {
  if (typeof value !== "string") {
    return { valid: false, message: messages[type] || "Invalid value" };
  }

  switch (type) {
    case "email":
      return emailRe.test(value)
        ? { valid: true, message: "" }
        : { valid: false, message: messages.email };

    case "url":
      return urlRe.test(value)
        ? { valid: true, message: "" }
        : { valid: false, message: messages.url };

    case "phone":
      return phoneRe.test(value)
        ? { valid: true, message: "" }
        : { valid: false, message: messages.phone };

    case "slug":
      return slugRe.test(value)
        ? { valid: true, message: "" }
        : { valid: false, message: messages.slug };

    case "required":
    case "notEmpty":
      return value.trim().length > 0
        ? { valid: true, message: "" }
        : { valid: false, message: messages.required };

    case "youtubeUrl":
      return youtubeRe.test(value)
        ? { valid: true, message: "" }
        : { valid: false, message: messages.youtubeUrl };

    case "vimeoUrl":
      return vimeoRe.test(value)
        ? { valid: true, message: "" }
        : { valid: false, message: messages.vimeoUrl };

    case "linkedinUrl":
      return linkedinRe.test(value)
        ? { valid: true, message: "" }
        : { valid: false, message: messages.linkedinUrl };

    case "xUrl":
      return xRe.test(value)
        ? { valid: true, message: "" }
        : { valid: false, message: messages.xUrl };

    case "facebookUrl":
      return facebookRe.test(value)
        ? { valid: true, message: "" }
        : { valid: false, message: messages.facebookUrl };

    case "instagramUrl":
      return instagramRe.test(value)
        ? { valid: true, message: "" }
        : { valid: false, message: messages.instagramUrl };

    case "tiktokUrl":
      return tiktokRe.test(value)
        ? { valid: true, message: "" }
        : { valid: false, message: messages.tiktokUrl };

    case "githubUrl":
      return githubRe.test(value)
        ? { valid: true, message: "" }
        : { valid: false, message: messages.githubUrl };

    case "videoUrl":
      return youtubeRe.test(value) || vimeoRe.test(value)
        ? { valid: true, message: "" }
        : { valid: false, message: messages.videoUrl };

    case "password":
      return value.length >= 6
        ? { valid: true, message: "" }
        : { valid: false, message: messages.password };

    case "numeric":
      return numericRe.test(value)
        ? { valid: true, message: "" }
        : { valid: false, message: messages.numeric };

    case "alphanumeric":
      return alphanumericRe.test(value)
        ? { valid: true, message: "" }
        : { valid: false, message: messages.alphanumeric };

    case "minLength":
      return typeof length === "number" && value.length >= length
        ? { valid: true, message: "" }
        : { valid: false, message: `Must be at least ${length} characters` };

    case "maxLength":
      return typeof length === "number" && value.length <= length
        ? { valid: true, message: "" }
        : { valid: false, message: `Must be at most ${length} characters` };

    default:
      return { valid: false, message: "Invalid value" };
  }
}
