// src/utils/bundle-colors.js

/**
 * Get color classes for a bundle based on its tag
 * This approach avoids dynamic class generation which doesn't work well with Tailwind's JIT
 * @param {string} bundleTag - The bundle tag to get colors for
 * @returns {object} - Object with color classes for different elements
 */
interface BundleColors {
  bgGradientFrom: string;
  bgGradientTo: string;
  bgLight: string;
  bgMedium: string;
  border: string;
  textTitle: string;
  textIcon: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  buttonBg: string;
  buttonHover: string;
  buttonDark: string;
  buttonDarkHover: string;
}

export const getBundleColors = (bundleId: string): BundleColors => {
  // Default to indigo if no matching tag is found
  let baseColor = "indigo";

  // Map tags to colors
  if (bundleId === "full-length-csat-bundle") baseColor = "indigo";
  else if (bundleId === "prelims-bundle") baseColor = "blue";
  else if (bundleId === "mains") baseColor = "purple";
  else if (bundleId === "interview") baseColor = "green";
  else if (bundleId === "state-psc") baseColor = "amber";

  // Return an object with all the color classes we need
  return {
    // Background colors
    bgGradientFrom: `from-${baseColor}-50`,
    bgGradientTo:
      baseColor === "indigo" ? "to-purple-50" : `to-${baseColor}-50`,
    bgLight: `bg-${baseColor}-50`,
    bgMedium: `bg-${baseColor}-100`,

    // Border colors
    border: `border-${baseColor}-100`,

    // Text colors
    textTitle: `text-${baseColor}-800`,
    textIcon: `text-${baseColor}-600`,

    // Badge colors
    badgeBg: `bg-${baseColor}-100`,
    badgeText: `text-${baseColor}-800`,
    badgeBorder: `border-${baseColor}-200`,

    // Button colors
    buttonBg: `bg-${baseColor}-600`,
    buttonHover: `hover:bg-${baseColor}-700`,
    buttonDark: `bg-${baseColor}-700`,
    buttonDarkHover: `hover:bg-${baseColor}-800`,
  };
};

/**
 * Get classes for a bundle card container
 * @param {string} bundleTag - The bundle tag
 * @returns {string} - Combined class string
 */
export const getBundleCardContainerClasses = (bundleId: string): string => {
  const colors = getBundleColors(bundleId);
  return `col-span-1 md:col-span-2 lg:col-span-3 bg-gradient-to-br ${colors.bgGradientFrom} ${colors.bgGradientTo} rounded-xl shadow-sm ${colors.border} overflow-hidden transition-all hover:shadow-md`;
};

/**
 * Get classes for bundle title and icon
 * @param {string} bundleTag - The bundle tag
 * @returns {object} - Object with title and icon classes
 */
interface BundleTitleClasses {
  title: string;
  icon: string;
}

export const getBundleTitleClasses = (bundleId: string): BundleTitleClasses => {
  const colors = getBundleColors(bundleId);
  return {
    title: `font-bold ${colors.textTitle} text-lg`,
    icon: `h-5 w-5 ${colors.textIcon}`,
  };
};

/**
 * Get classes for bundle badge
 * @param {string} bundleTag - The bundle tag
 * @returns {string} - Combined class string for badge
 */
interface BundleBadgeClasses {
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}

export const getBundleBadgeClasses = (bundleId: string): string => {
  const colors: BundleBadgeClasses = getBundleColors(bundleId);
  return `${colors.badgeBg} ${colors.badgeText} ${colors.badgeBorder}`;
};

/**
 * Get classes for bundle button
 * @param {string} bundleTag - The bundle tag
 * @param {boolean} isDark - Whether to use the darker variant
 * @returns {string} - Combined class string for button
 */
interface BundleButtonClasses {
  buttonBg: string;
  buttonHover: string;
  buttonDark: string;
  buttonDarkHover: string;
}

export const getBundleButtonClasses = (
  bundleId: string,
  isDark: boolean = false
): string => {
  const colors: BundleButtonClasses = getBundleColors(bundleId);
  return isDark
    ? `w-full py-2 px-4 ${colors.buttonDark} ${colors.buttonDarkHover} text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center`
    : `w-full py-2 px-4 ${colors.buttonBg} ${colors.buttonHover} text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center`;
};

const bundleUtils = {
  getBundleColors,
  getBundleCardContainerClasses,
  getBundleTitleClasses,
  getBundleBadgeClasses,
  getBundleButtonClasses,
};

export default bundleUtils;
