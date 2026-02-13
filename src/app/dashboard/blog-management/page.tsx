
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { getAllPosts, deletePost } from '@/ai/flows/blog';
import type { Post } from '@/ai/flows/blog.types';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
// Assume a PostEditorModal exists for creating/editing posts
// import { PostEditorModal } from '@/components/ui/post-editor-modal';

export default function BlogManagementPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchPosts = async () => {
        setIsLoading(true);
        try {
            const fetchedPosts = await getAllPosts();
            setPosts(fetchedPosts);
        } catch (error) {
            console.error("Failed to fetch posts:", error);
            toast({ title: "Fehler beim Laden", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleDelete = async (postId: string, postTitle: string) => {
        try {
            await deletePost(postId);
            toast({
                title: "Beitrag gelöscht",
                description: `"${postTitle}" wurde erfolgreich entfernt.`
            });
            fetchPosts();
        } catch (error) {
            toast({ title: "Fehler beim Löschen", variant: "destructive" });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Blog-Verwaltung</h1>
                    <p className="text-muted-foreground">Erstellen, bearbeiten und verwalten Sie hier Ihre Blogbeiträge.</p>
                </div>
                <Button disabled><PlusCircle className="mr-2 h-4 w-4"/> Neuen Beitrag erstellen</Button>
            </div>

            <Card>
                <CardContent className="p-0">
                    {isLoading ? <p className="p-4">Lade Beiträge...</p> : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Titel</TableHead>
                                <TableHead>Autor</TableHead>
                                <TableHead>Datum</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aktionen</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {posts.map(post => (
                                <TableRow key={post.id || post.slug}>
                                    <TableCell className="font-semibold">{post.title}</TableCell>
                                    <TableCell>{post.author.name}</TableCell>
                                    <TableCell>{new Date(post.publishDate).toLocaleDateString('de-CH')}</TableCell>
                                    <TableCell><Badge>Veröffentlicht</Badge></TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" disabled><Edit className="h-4 w-4"/></Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Beitrag löschen?</AlertDialogTitle>
                                                        <AlertDialogDescription>Möchten Sie "{post.title}" wirklich löschen?</AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(post.id!, post.title)}>Löschen</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
