import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useFollow = ()=>{

    // userId is of the user we want to follow / unfollow

    const queryClient = useQueryClient();
    const {mutate : follow, isPending} = useMutation({
        mutationFn: async(userId)=>{
            try {
                const res = await fetch(`/api/users/follow/${userId}`, {method: "POST"});
                const data = await res.json();
                if(!res.ok){
                    throw new Error("Failed to follow user");
                }
                return data;
                    
            } catch (error) {
                throw new Error(error);
            }

        },
        onSuccess: ()=>{
            toast.success('Followed successfully');
            // invalidate queries to fetch updated user data after following
            Promise.all([
                queryClient.invalidateQueries({queryKey : ['authUser']}),
                queryClient.invalidateQueries({queryKey : ['suggestedUsers']}),
            ]);
        },onError:(error)=>{
            toast.error(error.message);
        }
    }) 

    return {follow, isPending};
}
export default useFollow;