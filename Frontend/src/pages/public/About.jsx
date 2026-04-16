import { Mail, Phone, Globe, MapPin, ExternalLink, Building2, Users, Car, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge }    from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCompany }  from '@/hooks/useCompany';
import { useBosses }   from '@/hooks/useCompany';
import { useManagers } from '@/hooks/useCompany';

// ─── Stat Card ────────────────────────────────────────────────────────────────

function AboutStat({ icon: Icon, label, value }) {
    return (
        <div className="text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Icon className="h-6 w-6 text-primary" />
            </div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-muted-foreground mt-1">{label}</p>
        </div>
    );
}

// ─── Team Member Card ─────────────────────────────────────────────────────────

function TeamCard({ member, role }) {
    const initials = member.name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase();

    return (
        <Card>
            <CardContent className="p-4 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 font-semibold text-primary">
                    {initials}
                </div>
                <div className="min-w-0">
                    <p className="font-medium truncate">{member.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{member.email}</p>
                    <Badge variant="outline" className="mt-1 capitalize text-xs">
                        {role}
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
}

// ─── Social Link ──────────────────────────────────────────────────────────────

function SocialLink({ href, label }) {
    if (!href) return null;
        return (
           <a  href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
               <ExternalLink className="h-4 w-4 text-cyan-500" />
            {label}
        </a>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function About() {
    const { data: company,  isLoading: loadingCompany  } = useCompany();
    const { data: bosses,   isLoading: loadingBosses   } = useBosses();
    const { data: managers, isLoading: loadingManagers } = useManagers();

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-16">

            {/* ── Hero ──────────────────────────────────────────────────────────── */}
            <section className="text-center">
                {loadingCompany ? (
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-64 mx-auto" />
                        <Skeleton className="h-4 w-full max-w-xl mx-auto" />
                        <Skeleton className="h-4 w-80 mx-auto" />
                    </div>
                ) : (
                    <>
                        {company?.logo?.url && (
                            <img
                                src={company.logo.url}
                                alt={company.name}
                                className="h-20 w-20 object-contain mx-auto mb-6 rounded-xl"
                            />
                        )}
                        <h1 className="text-4xl font-bold mb-4">{company?.name}</h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                            {company?.description}
                        </p>
                        {company?.foundedYear && (
                            <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4 text-amber-500" />
                                <span>Founded in {company.foundedYear}</span>
                            </div>
                        )}
                    </>
                )}
            </section>

            {/* ── Stats ─────────────────────────────────────────────────────────── */}
            <section>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <AboutStat icon={Building2} label="Locations"  value="6+" />
                    <AboutStat icon={Car}       label="Cars"       value="50+" />
                    <AboutStat icon={Users}     label="Customers"  value="1k+" />
                    <AboutStat icon={Calendar}  label="Years"      value={
                        company?.foundedYear
                            ? `${new Date().getFullYear() - company.foundedYear}+`
                            : '10+'
                    } />
                </div>
            </section>

            <Separator />

            {/* ── Contact ───────────────────────────────────────────────────────── */}
            <section>
                <h2 className="text-2xl font-bold mb-6">Contact Us</h2>
                {loadingCompany ? (
                    <div className="space-y-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="h-5 w-48" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            {company?.email && (
                                <a href={`mailto:${company.email}`}
                                    className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
                                    >
                                    <Mail className="h-4 w-4 text-fuchsia-500" />
                                    {company.email}
                                </a>
                            )}
                            {company?.phone && (
                                <a href={`tel:${company.phone}`}
                                className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
                                >
                                    <Phone className="h-4 w-4 text-emerald-500" />
                                    {company.phone}
                                </a>
                            )}
                            {company?.website && (
                                <a href={company.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
                                    >
                                    <Globe className="h-4 w-4 text-sky-500" />
                                    {company.website}
                                </a>
                            )}
                            {company?.address && (
                                <div className="flex items-start gap-3 text-sm text-muted-foreground">
                                    <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-indigo-500" />
                                    {company.address}
                                </div>
                            )}
                        </div>

                        {/* Social links */}
                        <div className="space-y-3">
                            <SocialLink href={company?.socialLinks?.facebook}  label="Facebook" />
                            <SocialLink href={company?.socialLinks?.instagram} label="Instagram" />
                            <SocialLink href={company?.socialLinks?.twitter}   label="Twitter" />
                            <SocialLink href={company?.socialLinks?.linkedin}  label="LinkedIn" />
                        </div>
                    </div>
                )}
            </section>

            <Separator />

            {/* ── Leadership ────────────────────────────────────────────────────── */}
            <section>
                <h2 className="text-2xl font-bold mb-2">Leadership</h2>
                <p className="text-muted-foreground mb-6">
                    The team behind Palash Rent a Car
                </p>

                {/* Bosses */}
                <div className="mb-8">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                        Directors
                    </h3>
                    {loadingBosses ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {Array.from({ length: 2 }).map((_, i) => (
                                <Skeleton key={i} className="h-20 rounded-xl" />
                            ))}
                        </div>
                    ) : bosses?.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No directors listed yet</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {bosses?.map((boss) => (
                                <TeamCard key={boss._id} member={boss} role="Director" />
                            ))}
                        </div>
                    )}
                </div>

                {/* Managers */}
                <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                        Branch Managers
                    </h3>
                    {loadingManagers ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <Skeleton key={i} className="h-20 rounded-xl" />
                            ))}
                        </div>
                    ) : managers?.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No managers listed yet</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {managers?.map((manager) => (
                                <TeamCard key={manager._id} member={manager} role="Manager" />
                            ))}
                        </div>
                    )}
                </div>
            </section>

        </div>
    );
}