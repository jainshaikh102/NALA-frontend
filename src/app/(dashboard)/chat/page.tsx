"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

const ChatRedirectPage = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const hasCreatedSession = useRef(false);

  useEffect(() => {
     if (!user?.username) {
      return;
    }

    // Generate a new UUID on the frontend
    const newChatId = crypto.randomUUID();
router.replace(`/chat/${newChatId}`);
    // createNewChatSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, user?.username]); // Intentionally excluding isCreatingSession to prevent multiple calls


  // const createNewChatSession = async () => {
  //     // Prevent multiple session creation
  //     if (!user?.username || isCreatingSession || hasCreatedSession.current) {
  //       return;
  //     }

  //     // Mark that we're starting session creation
  //     hasCreatedSession.current = true;
  //     setIsCreatingSession(true);

  //     try {
  //       // Create a new chat session immediately
  //       const sessionResponse = await fetch("/api/chat/start-session", {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({ username: user.username }),
  //       });

  //       if (sessionResponse.ok) {
  //         const sessionData = await sessionResponse.json();
  //         const newSessionId = sessionData.chat_session_id;

  //         // Navigate directly to the new chat session
  //         router.replace(`/chat/${newSessionId}`);
  //       } else {
  //         // Fallback to /new if session creation fails
  //         console.error("Failed to create chat session");
  //         router.replace("/chat/new");
  //         // Reset flag on error so user can try again
  //         hasCreatedSession.current = false;
  //       }
  //     } catch (error) {
  //       console.error("Error creating chat session:", error);
  //       // Fallback to /new if there's an error
  //       router.replace("/chat/new");
  //       // Reset flag on error so user can try again
  //       hasCreatedSession.current = false;
  //     } finally {
  //       setIsCreatingSession(false);
  //     }
  //   };


  // Show loading state while creating session
  return (
    <div className="h-screen bg-[#222C41] flex items-center justify-center rounded-2xl border border-[#FFFFFF3B]">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-foreground">Creating new chat...</p>
      </div>
    </div>
  );
};

export default ChatRedirectPage;
