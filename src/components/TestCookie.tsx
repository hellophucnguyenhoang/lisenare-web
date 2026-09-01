import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { request } from "@/api/client";
import type { Token } from "@/types";

export default function TestCookie() {
  const queryClient = useQueryClient();

  // 1. GET DATA (Query)
  const { data: userData } = useQuery({
    queryKey: ["me"],
    queryFn: () => request("/learners/me"),
  });

  // 2. LOGIN (Mutation)
  const loginMutation = useMutation({
    mutationFn: async () => {
      const formData = new URLSearchParams({
        username: "hoangphuc",
        password: "kcmtl5cM#",
      });
      return request<Token>("/auth/login", { method: "POST", body: formData });
    },
    onSuccess: () => {
      // Automatically refresh the profile data after logging in
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });

  // 3. LOGOUT (Mutation)
  const logoutMutation = useMutation({
    mutationFn: () =>
      request<{ message: string }>("/auth/logout", { method: "POST" }),
    onSuccess: () => {
      // Clear user data from cache on logout
      queryClient.setQueryData(["me"], null);
    },
  });

  return (
    <div className="max-w-md mx-auto my-10 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">
        Cookie Tester
      </h3>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <button
          onClick={() => loginMutation.mutate()}
          disabled={loginMutation.isPending}
          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50"
        >
          {loginMutation.isPending ? "Logging in..." : "Login"}
        </button>

        <button
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
          className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded disabled:opacity-50"
        >
          Logout
        </button>

        <button
          onClick={() => queryClient.invalidateQueries({ queryKey: ["me"] })}
          className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded"
        >
          Refetch Me
        </button>
      </div>

      <div className="p-4 bg-gray-50 border rounded">
        <pre className="text-xs whitespace-pre-wrap">
          {userData ? JSON.stringify(userData, null, 2) : "No user logged in"}
        </pre>
      </div>
    </div>
  );
}
