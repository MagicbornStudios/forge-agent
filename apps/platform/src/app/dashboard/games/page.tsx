'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ExternalLink, Search } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useCreatorProjects } from '@/lib/data/hooks/use-dashboard-data';
import { getStudioApiUrl } from '@/lib/api/studio';

export default function DashboardGamesPage() {
  const { user, isLoading: authLoading, activeOrganizationId } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const projectsQuery = useCreatorProjects(activeOrganizationId, !!user);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login?returnUrl=/dashboard/games');
    }
  }, [authLoading, user, router]);

  const filtered = useMemo(() => {
    const projects = projectsQuery.data ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((project) => {
      return (
        project.title.toLowerCase().includes(q) ||
        project.slug.toLowerCase().includes(q) ||
        (project.listing?.title ?? '').toLowerCase().includes(q)
      );
    });
  }, [projectsQuery.data, query]);

  if (authLoading || projectsQuery.isLoading) {
    return (
      <main className="p-6">
        <p className="text-sm text-muted-foreground">Loading games...</p>
      </main>
    );
  }

  if (!user) return null;

  const error =
    projectsQuery.error instanceof Error
      ? projectsQuery.error.message
      : projectsQuery.error
        ? 'Failed to load projects'
        : null;

  return (
    <main className="space-y-6 p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">My games</h1>
        <p className="text-sm text-muted-foreground">
          Projects connected to your creator workspace and listing workflow.
        </p>
      </header>

      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by game or listing name"
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-sm text-muted-foreground">
            No projects found for this organization.
          </CardContent>
        </Card>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((project) => (
            <Card key={project.id}>
              <CardHeader className="space-y-2">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">{project.title}</CardTitle>
                  <Badge variant="outline">{project.domain ?? 'forge'}</Badge>
                </div>
                <CardDescription>/{project.slug}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1 text-sm">
                  <p className="text-muted-foreground">Listing</p>
                  {project.listing ? (
                    <div className="space-y-1">
                      <p className="font-medium">{project.listing.title}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant={project.listing.status === 'published' ? 'secondary' : 'outline'}>
                          {project.listing.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{project.listing.cloneMode}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Not listed yet</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild variant="outline" size="sm">
                    <a href={`${getStudioApiUrl()}/?projectId=${project.id}`} target="_blank" rel="noreferrer">
                      Open in Studio
                      <ExternalLink className="size-3.5" />
                    </a>
                  </Button>
                  {project.listing ? (
                    <Button asChild size="sm">
                      <Link href={`/catalog/${project.listing.slug}`}>View listing</Link>
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      )}
    </main>
  );
}
