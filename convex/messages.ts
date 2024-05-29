import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
    args: {},
    handler: async (ctx) => {
        // Grab the most recent messages.
        const messages = await ctx.db.query("messages").order("desc").take(100);

        const messageWithLikes = await Promise.all(
            messages.map(async (message) => {
                const likes = await ctx.db
                    .query("likes")
                    .withIndex("byMessageId", (q) => q.eq("messageId", message._id))
                    .collect();
                console.log(likes);

                return {
                    ...message,
                    likes: likes.length,
                };
            })
        );
        // Reverse the list so that it's in a chronological order.
        return messageWithLikes.reverse().map((message) => ({
            ...message,
            body: message.body.replaceAll(":)", "🙂"),
        }));
    },
});

export const send = mutation({
    args: { body: v.string(), author: v.string() },
    handler: async (ctx, { body, author }) => {
        // Send a new message.
        await ctx.db.insert("messages", { body, author });
    },
});

export const like = mutation({
    args: { liker: v.string(), messageId: v.id("messages") },
    handler: async (ctx, args) => {
        await ctx.db.insert("likes", args);
    },
});
