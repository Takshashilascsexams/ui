import getClerkToken from "@/actions/client/getClerkToken";

/**
 * Service to interact with admin user-related API endpoints
 */
class UserAdminService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
  }

  /**
   * Get all users for admin dashboard
   * @param page Page number
   * @param limit Items per page
   * @param sortBy Field to sort by
   * @param sortOrder Sort order (asc or desc)
   * @param filters Optional filters
   */
  async getAllUsers(
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
    filters: Record<string, string> = {}
  ) {
    const token = await getClerkToken();
    if (!token) throw new Error("Authentication token not available");

    // Build query string from filters
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      sortOrder,
    });

    // Add any additional filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });

    const response = await fetch(
      `${this.apiUrl}/user?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch users");
    }

    return await response.json();
  }

  /**
   * Get a specific user by ID
   * @param userId ID of the user to fetch
   */
  async getUserById(userId: string) {
    const token = await getClerkToken();
    if (!token) throw new Error("Authentication token not available");

    const response = await fetch(`${this.apiUrl}/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store", // Always fetch fresh data
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch user details");
    }

    return await response.json();
  }
}

// Export as singleton
const userAdminService = new UserAdminService();
export default userAdminService;
