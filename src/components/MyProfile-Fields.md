# MyProfile Form Fields

## Basic Info tab

| # | Label | Key | Type | StatusIcon | Blocks save |
|---|---|---|---|---|---|
| 1 | Profile Picture | `userData.profilePicture` | File upload (crop) | ✓ | No |
| 2 | Cover Image | `userData.coverImage` | File upload (crop) | ✓ | No |
| 3 | **First Name** | `formData.name` | Text input | ✓ | **Yes** |
| 4 | Last Name | `formData.lastName` | Text input | — | No |
| 5 | **Username** | `formData.userName` | Text input (max 15) | ✓ | **Yes** |
| 6 | Email | `formData.email` | Email (disabled) | ✓ | No |
| 7 | Phone | `formData.phone` | Custom phone input | — | No |
| 8 | Current Position | `formData.currentPosition` | Text input | — | No |
| 9 | Category | `formData.category` | Searchable select | ✓ | No |
| 10 | Date of Birth | `formData.dob` | Date input | ✓ | No |
| 11 | Age | `formData.age` | Dropdown | — | No |
| 12 | Gender | `formData.gender` | Dropdown | — | No |
| 13 | Language | `formData.language` | Dropdown | — | No |
| 14 | Qualification | `formData.qualification` | Dropdown | — | No |
| 15 | Experience | `formData.experienceYears` | Dropdown | ✓ | No |
| 16 | Offered Salary | `formData.offeredSalary` | Number input | ✓ | No |
| 17 | Salary Type | `formData.salaryType` | Dropdown | ✓ | No |
| 18 | Description | `formData.description` | Rich text editor | — | No |
| 19 | Address | `formData.address` | Text input | — | No |
| 20 | Postal Code | `formData.postal` | Text input | — | No |
| 21 | Country | `formData.country` | Searchable select | — | No |
| 22 | City | `formData.city` | Searchable select | — | No |
| 23 | LinkedIn | `formData.linkedin` | Text input | ✓* | No |
| 24 | X (Twitter) | `formData.x` | Text input | ✓* | No |
| 25 | Facebook | `formData.facebook` | Text input | ✓* | No |
| 26 | Instagram | `formData.instagram` | Text input | ✓* | No |
| 27 | YouTube | `formData.youtube` | Text input | ✓* | No |
| 28 | TikTok | `formData.tiktok` | Text input | ✓* | No |
| 29 | GitHub | `formData.github` | Text input | ✓* | No |
| 30 | Other Social Networks | `formData.customSocialNetworks[].{network,url}` | Text inputs (dynamic) | — | No |
| 31 | Video Introduction | `formData.videoUrl` | Text input | — | No |

## Education tab

| # | Label | Key | Type | Blocks save |
|---|---|---|---|---|
| 32a | Degree Title | `formData.education[].title` | Text input | No |
| 32b | Level | `formData.education[].level` | Text input | No |
| 32c | From | `formData.education[].from` | Date input | No |
| 32d | To | `formData.education[].to` | Date input | No |
| 32e | Description | `formData.education[].description` | Rich text editor | No |

## Experience tab

| # | Label | Key | Type | Blocks save |
|---|---|---|---|---|
| 33a | Job Title | `formData.experience[].jobTitle` | Text input | No |
| 33b | Company | `formData.experience[].company` | Text input | No |
| 33c | From | `formData.experience[].from` | Date input | No |
| 33d | To | `formData.experience[].to` | Date input | No |
| 33e | Description | `formData.experience[].description` | Rich text editor | No |

## Skills tab

| # | Label | Key | Type | Blocks save |
|---|---|---|---|---|
| 34 | Skills | `formData.skills` | Skills selector (multi) | No |

## Projects tab

| # | Label | Key | Type | Blocks save |
|---|---|---|---|---|
| 35a | Project Title | `formData.projects[].title` | Text input | No |
| 35b | Link | `formData.projects[].link` | Text input | No |
| 35c | Description | `formData.projects[].description` | Rich text editor | No |
| 35d | Project Images | `formData.projects[].images` | File upload (multi) | No |

## Awards tab

| # | Label | Key | Type | Blocks save |
|---|---|---|---|---|
| 36a | Award Title | `formData.awards[].title` | Text input | No |
| 36b | Date Awarded | `formData.awards[].date` | Date input | No |
| 36c | Description | `formData.awards[].description` | Rich text editor | No |

---

**Legend:**
- **Bold** = blocks save when invalid (only First Name + Username)
- `✓` = StatusIcon shown next to label
- `✓*` = StatusIcon shown inside input only when field has a value
- `—` = no StatusIcon

**Bugs noted:**
- GitHub StatusIcon references `formData.tiktok` instead of `formData.github`
- Experience tab header says "Projects {idx+1}" instead of "Experience {idx+1}"
- Unrendered state fields: `headline`, `currency`, `resume`, `portfolio`, `isPhoneVerified`
