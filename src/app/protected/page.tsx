'use client';

import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ExpandableSection from '../components/ExpandableSection';


interface Comment {
    id: string;
    user_id: string;
    comment_text: string;
    created_at: string;
    parent_id: string | null;
    user_email?: string;
}

export default function ProtectedPage() {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [replies, setReplies] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        if (!user) {
            router.push('/login');
        } else {
            fetchComments();
        }
    }, [user, router]);

    // const fetchComments = async () => {
    //     const { data, error } = await supabase
    //         .from('comments')
    //         .select(`
    //             id, 
    //             user_id, 
    //             comment_text, 
    //             created_at, 
    //             parent_id, 
    //             users:user_id (email)
    //         `)
    //         .order('created_at', { ascending: false });
    
    //     if (error) console.error(error);
    //     else setComments(data || []);
    // };

    const fetchComments = async () => {
        try {
          const { data, error } = await supabase
            .from('comments')
            .select('*');
          if (error) {
            throw error;
          }else setComments(data || []);
      
          return data;
        } catch (error) {
          console.error(error);
        }
      };
      

    const handleAddComment = async (parentId: string | null = null) => {
        if (!newComment.trim() || !user) return;
    
        const { error } = await supabase.from('comments').insert([
            { user_id: user.id, comment_text: newComment, parent_id: parentId },
        ]);
        
        if (error) {
            console.error('Supabase Error:', error);
            alert(`Error: ${error.message || 'Unknown error occurred'}`);
        } else {
            setNewComment('');
            fetchComments(); // Refresh comments after adding a new one
        }
    };
    
    

    const handleReplyChange = (commentId: string, text: string) => {
        setReplies({ ...replies, [commentId]: text });
    };

    const handleAddReply = async (commentId: string) => {
        const replyText = replies[commentId];
        if (!replyText.trim() || !user ) return;

        const {  error } = await supabase.from('comments').insert([
            { user_id: user.id, comment_text: replyText, parent_id: commentId },
        ]);

        if (error) console.error(error);
        else {
            setReplies({ ...replies, [commentId]: '' });
            fetchComments();
        }
    };

    if (!user) return null;

    return (
        <div>
        <div className="mt-16 mb-10 flex flex-col items-center justify-center ">

            <h1 className="text-2xl font-bold">Protected Page</h1>
            
 
                <p>Welcome, {user.email}!</p>
            <button
                onClick={signOut}
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
            >
                Sign Out
            </button>

        {/* Comment Input */}
        <div className="mt-6 max-w-md">
                <textarea
                    className="w-full p-2 border rounded"
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                />
                <button onClick={() => handleAddComment()} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">
                    Add Comment
                </button>
            </div><br></br><h1 className="text-3xl font-bold items-center justify-center">Leave us a Comment</h1>
            </div>
            
            <div className="mr-10 ml-10">
        <ExpandableSection title='View Comments'>
            {/* Comments Section */}
            <div className="ml-10 mr-10 text-black">
                {comments
                    .filter((c) => !c.parent_id) // Only show top-level comments
                    .map((comment) => (
                        <div key={comment.id} className="mb-4 p-2 border rounded">
                            <p className="text-sm text-black-600">{comment.user_email}</p>
                            <p className="text-lg">{comment.comment_text}</p>
                            <div className="ml-2 mt-2">
                                <textarea
                                    className="w-full p-2 text-black border rounded"
                                    placeholder="Write a reply..."
                                    value={replies[comment.id] || ''}
                                    onChange={(e) => handleReplyChange(comment.id, e.target.value)}
                                />
                                <button
                                    onClick={() => handleAddReply(comment.id)}
                                    className="mt-2 px-4 py-1 bg-green-500 text-white rounded"
                                >
                                    Reply
                                </button>
                            </div>

                            {/* Replies */}
                            <div className="ml-10 mt-2 text-black border-l-2 pl-2">
                                {comments
                                    .filter((c) => c.parent_id === comment.id) // Show only replies to this comment
                                    .map((reply) => (
                                        <div key={reply.id} className="mt-2">
                                            <p className="text-sm text-black-600">{reply.user_email}</p>
                                            <p className="text-md">{reply.comment_text}</p>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    ))}
            </div></ExpandableSection></div><br></br>
        </div>
    );
}
