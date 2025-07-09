"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/convex/_generated/api";
import { useConvexQuery } from "@/hooks/use-convex-query";
import { BarLoader } from "react-spinners";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Users, User } from "lucide-react";
import { CreateGroupModal } from "./components/create-group-modal";

export default function ContactsPage() {
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data, isLoading } = useConvexQuery(api.contacts.getAllContacts);

  // Check for the createGroup parameter when the component mounts
  useEffect(() => {
    const createGroupParam = searchParams.get("createGroup");

    if (createGroupParam === "true") {
      // Open the modal
      setIsCreateGroupModalOpen(true);

      // Remove the parameter from the URL
      const url = new URL(window.location.href);
      url.searchParams.delete("createGroup");

      // Replace the current URL without the parameter
      router.replace(url.pathname + url.search);
    }
  }, [searchParams, router]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-12">
        <BarLoader width={"100%"} color="hsl(var(--primary))" />
      </div>
    );
  }

  const { users, groups } = data || { users: [], groups: [] };

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between mb-6 animate-slide-up">
        <h1 className="text-5xl title-blue animate-typewriter">Contacts</h1>
        <Button 
          onClick={() => setIsCreateGroupModalOpen(true)}
          className="btn-enhanced hover-lift hover-pulse"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Group
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in animate-delay-200">
        {/* Individual Contacts */}
        <div className="animate-slide-up animate-delay-300">
          <h2 className="text-xl font-bold mb-4 flex items-center animate-slide-right animate-delay-400">
            <User className="mr-2 h-5 w-5" />
            People
          </h2>
          {users.length === 0 ? (
            <Card className="card-enhanced animate-scale-in animate-delay-500">
              <CardContent className="py-6 text-center text-muted-foreground">
                <div className="flex flex-col items-center space-y-4">
                  <User className="h-12 w-12 text-muted-foreground animate-float" />
                  <p>No contacts yet. Add an expense with someone to see them here.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col gap-4">
              {users.map((user, index) => (
                <Link key={user.id} href={`/person/${user.id}`}>
                  <Card className="hover:bg-muted/30 transition-colors cursor-pointer card-enhanced hover-lift card-stack animate-slide-up" 
                        style={{ animationDelay: `${500 + index * 100}ms` }}>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 animate-bounce-in animate-delay-100">
                            <AvatarImage src={user.imageUrl} />
                            <AvatarFallback>
                              {user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium animate-slide-right animate-delay-200">{user.name}</p>
                            <p className="text-sm text-muted-foreground animate-slide-right animate-delay-300">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Groups */}
        <div className="animate-slide-up animate-delay-400">
          <h2 className="text-xl font-bold mb-4 flex items-center animate-slide-right animate-delay-500">
            <Users className="mr-2 h-5 w-5" />
            Groups
          </h2>
          {groups.length === 0 ? (
            <Card className="card-enhanced animate-scale-in animate-delay-600">
              <CardContent className="py-6 text-center text-muted-foreground">
                <div className="flex flex-col items-center space-y-4">
                  <Users className="h-12 w-12 text-muted-foreground animate-float" />
                  <p>No groups yet. Create a group to start tracking shared expenses.</p>
                  <Button 
                    onClick={() => setIsCreateGroupModalOpen(true)}
                    className="btn-accent hover-pulse btn-enhanced"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Group
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col gap-4">
              {groups.map((group, index) => (
                <Link key={group.id} href={`/groups/${group.id}`}>
                  <Card className="hover:bg-muted/30 transition-colors cursor-pointer card-enhanced hover-lift card-stack animate-slide-up" 
                        style={{ animationDelay: `${600 + index * 100}ms` }}>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 p-2 rounded-md animate-bounce-in animate-delay-100">
                            <Users className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium animate-slide-right animate-delay-200">{group.name}</p>
                            <p className="text-sm text-muted-foreground animate-slide-right animate-delay-300">
                              {group.memberCount} members
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateGroupModal
        isOpen={isCreateGroupModalOpen}
        onClose={() => setIsCreateGroupModalOpen(false)}
        onSuccess={(groupId) => {
          router.push(`/groups/${groupId}`);
        }}
      />
    </div>
  );
}
