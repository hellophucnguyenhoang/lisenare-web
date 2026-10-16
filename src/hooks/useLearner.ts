import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { request } from "@/api/client";
import {
  apiSendEmailChangeOtp,
  apiChangeEmail,
  type EmailChangeOTPParams,
  type EmailChangeParams,
} from "@/api/auth";
import type { Learner, RetrievalLang } from "@/types";

interface LearnerDetailApi {
  id: number;
  name: string;
  email: string | null;
  retrieval_lang?: string;
}

function toLearner(api: LearnerDetailApi): Learner {
  const retrieval_lang = (api.retrieval_lang as RetrievalLang) || "en";
  return {
    id: api.id,
    name: api.name,
    email: api.email,
    retrieval_lang,
    retrievalLang: retrieval_lang,
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

export function useUpdateRetrievalLang() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (retrieval_lang: RetrievalLang) =>
      request<unknown>("/learners/me", {
        method: "PATCH",
        body: { retrieval_lang },
      }),
    onMutate: async (newLang: RetrievalLang) => {
      await qc.cancelQueries({ queryKey: ["learner", "me"] });
      const previousLearner = qc.getQueryData<Learner>(["learner", "me"]);
      if (previousLearner) {
        qc.setQueryData<Learner>(["learner", "me"], {
          ...previousLearner,
          retrieval_lang: newLang,
          retrievalLang: newLang,
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
    mutationFn: (params: EmailChangeOTPParams) => apiSendEmailChangeOtp(params),
  });
}

export function useChangeEmail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: EmailChangeParams) => apiChangeEmail(params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["learner"] }),
  });
}
