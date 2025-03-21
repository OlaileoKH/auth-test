// components/CommentSection.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import ExpandableSection from './ExpandableSection';
import { User } from '@supabase/supabase-js';
import { formatDistanceToNow } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

interface Comment {
    id: string;
    user_id: string;
    comment_text: string;
    created_at: string;
    parent_id: string | null;
    user_email?: string;
}

interface CommentSectionProps {
    user: User | null;
    onCommentClick: () => void; // Add this prop
}

export default function CommentSection({ user, onCommentClick }: CommentSectionProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [replies, setReplies] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        fetchComments();
    }, []);

    const fetchComments = async () => {
        try {
            const { data, error } = await supabase
                .from('comments')
                .select('id, user_id, comment_text, created_at, parent_id, user_email')
                .order('created_at', { ascending: false });

            if (error) {
                throw error;
            }

            if (data) {
                setComments(data);
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    const handleAddComment = async (parentId: string | null = null) => {
        if (!user) {
            onCommentClick(); // Trigger the login prompt
            return;
        }

        if (!newComment.trim()) return;

        const { error } = await supabase.from('comments').insert([
            { 
                user_id: user.id, 
                comment_text: newComment, 
                parent_id: parentId,
                user_email: user.email, // Add the user's email
            },
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
        if (!user) {
            onCommentClick(); // Trigger the login prompt
            return;
        }

        const replyText = replies[commentId];
        if (!replyText.trim()) return;

        const { error } = await supabase.from('comments').insert([
            { 
                user_id: user.id, 
                comment_text: replyText, 
                parent_id: commentId,
                user_email: user.email, // Add the user's email
            },
        ]);

        if (error) console.error(error);
        else {
            setReplies({ ...replies, [commentId]: '' });
            fetchComments();
        }
    };

    // Function to format the date in IST and human-readable format
    const formatDate = (timestamp: string) => {
        const date = new Date(timestamp); // Parse the timestamp
        const istDate = toZonedTime(date, 'Asia/Kolkata'); // Convert to IST
        return formatDistanceToNow(istDate, { addSuffix: true }); // Format as "just now" or "5 minutes ago"
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mt-10 mb-10 flex flex-col items-center justify-center">Leave us a Comment</h1>
            {/* Comment Input */}
            <div className="mt-6 ml-10 mr-10">
                <textarea
                    className="w-full p-2 border rounded"
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                />
                <button 
                    onClick={() => handleAddComment()} 
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
                >
                    Add Comment
                </button>
            </div>

            <br />

            <div className="mr-10 ml-10">
                <ExpandableSection title="View Comments">
                    {/* Comments Section */}
                    <div className="ml-10 mr-10 text-black">
                        {comments
                            .filter((c) => !c.parent_id) // Only show top-level comments
                            .map((comment) => (
                                <div key={comment.id} className="mb-4 p-2 border rounded">
                                    <p className="text-sm text-black-600">
                                        {comment.user_email} • {formatDate(comment.created_at)}
                                    </p>
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
                                                    <p className="text-sm text-black-600">
                                                        {reply.user_email} • {formatDate(reply.created_at)}
                                                    </p>
                                                    <p className="text-md">{reply.comment_text}</p>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            ))}
                    </div>
                </ExpandableSection>
            </div>
        </div>
    );
}