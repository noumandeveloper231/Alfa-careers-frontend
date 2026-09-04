export const calculateProfileScore = (user) => {
  let score = 0;

  // ========== BASIC INFO (30 points) ==========
  // Name (required, 3 points)
  if (user.name && user.name.trim() !== "") {
    score += 3;
  }

  // Phone (3 points)
  if (user.phone && user.phone.trim() !== "") {
    score += 3;
  }

  // Current Position (3 points)
  if (user.currentPosition && user.currentPosition.trim() !== "") {
    score += 3;
  }

  // Description (5 points)
  if (user.description && user.description.trim() !== "") {
    score += 5;
  }

  // Date of Birth (3 points)
  if (user.dob) {
    score += 3;
  }

  // Gender (2 points)
  if (user.gender && user.gender.trim() !== "") {
    score += 2;
  }

  if (user.age && user.age.trim() !== "") {
    score += 2;
  }

  // Username (2 points)
  if (user.userName && user.userName.trim() !== "") {
    score += 2;
  }

  // Category (3 points)
  if (user.category && user.category.trim() !== "") {
    score += 3;
  }

  // Language (3 points if at least 1)
  if (user.language && user.language.length > 0) {
    score += 3;
  }

  // Salary Type (3 points)
  if (user.salaryType && user.salaryType.trim() !== "") {
    score += 3;
  }

  // Qualification (5 points)
  if (user.qualification && user.qualification.trim() !== "") {
    score += 5;
  }

  // Experience Years (5 points)
  if (user.experienceYears && user.experienceYears.trim() !== "") {
    score += 5;
  }

  // Skills (5 points if at least 3)
  if (user.skills && user.skills.length >= 2) {
    score += 5;
  }

  // Offered Salary (5 points if > 0)
  if (user.offeredSalary && user.offeredSalary > 0) {
    score += 5;
  }

  // ========== MEDIA (15 points) ==========
  // Profile Picture (4 points)
  if (user.profilePicture && user.profilePicture.trim() !== "") {
    score += 4;
  }

  // Cover Image (3 points)
  if (user.coverImage && user.coverImage.trim() !== "") {
    score += 3;
  }

  // Video URL (23 points = ~20%)
  if (user.videoUrl && user.videoUrl.trim() !== "") {
    score += 23;
  }

  // ========== LOCATION (10 points) ==========
  // Address (3 points)
  if (user.address && user.address.trim() !== "") {
    score += 3;
  }

  // City (3 points)
  if (user.city && user.city.trim() !== "") {
    score += 3;
  }

  // Country (3 points)
  if (user.country && user.country.trim() !== "") {
    score += 3;
  }

  // Postal Code (1 point)
  if (user.postal && user.postal.trim() !== "") {
    score += 1;
  }

  // ========== EXPERIENCE & EDUCATION (10 points) ==========
  // Education (5 points if at least 1 entry)
  if (user.education && user.education.length > 0) {
    score += 5;
  }

  // Experience (5 points if at least 1 entry)
  if (user.experience && user.experience.length > 0) {
    score += 5;
  }

  // ========== PROJECTS & AWARDS (5 points) ==========
  // Projects (3 points if at least 1)
  if (user.projects && user.projects.length > 0) {
    score += 3;
  }

  // Awards (2 points if at least 1)
  if (user.awards && user.awards.length > 0) {
    score += 2;
  }

  // ========== SOCIAL LINKS (5 points) ==========
  let socialCount = 0;

  // Count predefined social links
  if (user.linkedin && user.linkedin.trim() !== "") socialCount++;
  if (user.x && user.x.trim() !== "") socialCount++;
  if (user.facebook && user.facebook.trim() !== "") socialCount++;
  if (user.instagram && user.instagram.trim() !== "") socialCount++;
  if (user.youtube && user.youtube.trim() !== "") socialCount++;
  if (user.tiktok && user.tiktok.trim() !== "") socialCount++;
  if (user.github && user.github.trim() !== "") socialCount++;

  // Count custom social networks
  if (user.customSocialNetworks && user.customSocialNetworks.length > 0) {
    socialCount += user.customSocialNetworks.filter(
      (s) => s.url && s.url.trim() !== "",
    ).length;
  }

  // Award points based on social link count (max 5 points)
  if (socialCount >= 2) {
    score += Math.min(socialCount, 5);
  }

  const maxScore = 112;
  const percentage = Math.min(100, Math.round((score / maxScore) * 100));

  return percentage;
};

export const SCORE = {
  // ========== BASIC INFO ==========
  name: 3,
  phone: 3,
  currentPosition: 3,
  description: 5,
  dob: 3,
  gender: 2,
  age: 2,
  userName: 2,
  category: 3,
  language: 3,
  salaryType: 3,
  qualification: 5,
  experienceYears: 5,
  skills: 5,
  offeredSalary: 5,

  // ========== MEDIA ==========
  profilePicture: 4,
  coverImage: 3,
  videoUrl: 23,

  // ========== LOCATION ==========
  address: 3,
  city: 3,
  country: 3,
  postal: 1,

  // ========== EXPERIENCE & EDUCATION ==========
  education: 5,
  experience: 5,

  // ========== PROJECTS & AWARDS ==========
  projects: 3,
  awards: 2,

  // ========== SOCIAL LINKS ==========
  social: 5,

  // ========== TOTAL ==========
  maxScore: 112,
};