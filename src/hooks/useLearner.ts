import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { request } from "@/api/client";
import {
  apiSendEmailChangeOtp,
  apiChangeEmail,
  type EmailChangeOTPParams,
  type EmailChangeParams,
} from "@/api/auth";
import {
  getLearnerMe,
  getLearnerAvatarUrl,
  updateLearnerAvatar,
  updateLearnerName,
  updateLearnerRetrievalLang,
} from "@/api/learner";
import type { Learner, RetrievalLang } from "@/types";

export function useLearnerMe() {
  return useQuery({
    queryKey: ["learner", "me"],
    queryFn: () => getLearnerMe(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
  });
}

export function useLearnerAvatar(avatarPath?: string | null) {
  return useQuery({
    queryKey: ["learner", "avatar", avatarPath],
    queryFn: () => getLearnerAvatarUrl(),
    enabled: Boolean(avatarPath),
    staleTime: 10 * 60 * 1000,
  });
}

export function useUpdateLearnerAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => updateLearnerAvatar(file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["learner"] });
    },
  });
}

export function useUpdateLearnerName() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => updateLearnerName(name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["learner"] }),
  });
}

export function useUpdateRetrievalLang() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (retrievalLang: RetrievalLang) =>
      updateLearnerRetrievalLang(retrievalLang),
    onMutate: async (newLang: RetrievalLang) => {
      await qc.cancelQueries({ queryKey: ["learner", "me"] });
      const previousLearner = qc.getQueryData<Learner>(["learner", "me"]);
      if (previousLearner) {
        qc.setQueryData<Learner>(["learner", "me"], {
          ...previousLearner,
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
