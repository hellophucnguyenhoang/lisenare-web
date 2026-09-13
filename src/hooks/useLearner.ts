import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { request } from "@/api/client";
import {
  apiSendEmailChangeOtp,
  apiChangeEmail,
  type EmailChangeOTPParams,
  type EmailChangeParams,
} from "@/api/auth";
import type { Learner, PracticeLang } from "@/types";

interface LearnerDetailApi {
  id: number;
  name: string;
  email: string | null;
  practice_lang?: string;
}

function toLearner(api: LearnerDetailApi): Learner {
  const practice_lang = (api.practice_lang as PracticeLang) || "en";
  return {
    id: api.id,
    name: api.name,
    email: api.email,
    practice_lang,
    practiceLang: practice_lang,
  };
}

export function useLearnerMe() {
  return useQuery({
    queryKey: ["learner", "me"],
    queryFn: async () => {
      const api = await request<LearnerDetailApi>("/learners/me");
      return toLearner(api);
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
  });
}

export function useUpdateLearnerName() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) =>
      request<unknown>("/learners/me", { method: "PATCH", body: { name } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["learner"] }),
  });
}

export function useUpdatePracticeLang() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (practice_lang: PracticeLang) =>
      request<unknown>("/learners/me", {
        method: "PATCH",
        body: { practice_lang },
      }),
    onMutate: async (newLang: PracticeLang) => {
      await qc.cancelQueries({ queryKey: ["learner", "me"] });
      const previousLearner = qc.getQueryData<Learner>(["learner", "me"]);
      if (previousLearner) {
        qc.setQueryData<Learner>(["learner", "me"], {
          ...previousLearner,
          practice_lang: newLang,
          practiceLang: newLang,
        });
      }
      return { previousLearner };
    },
    onError: (_err, _newLang, context) => {
      if (context?.previousLearner) {
        qc.setQueryData(["learner", "me"], context.previousLearner);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["learner"] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: { old_password: string; new_password: string }) =>
      request<unknown>("/accounts/password", {
        method: "PATCH",
        body: data,
      }),
  });
}

export function useSendEmailChangeOtp() {
  return useMutation({
    mutationFn: (params: EmailChangeOTPParams) =>
      apiSendEmailChangeOtp(params),
  });
}

export function useChangeEmail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: EmailChangeParams) => apiChangeEmail(params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["learner"] }),
  });
}
