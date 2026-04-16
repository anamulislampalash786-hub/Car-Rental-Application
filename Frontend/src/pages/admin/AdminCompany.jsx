import { useState } from 'react';
import { Building2, Loader2, Globe, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { Button }   from '@/components/ui/button';
import { Input }    from '@/components/ui/input';
import { Label }    from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useCompany, useCreateCompany, useUpdateCompany } from '@/hooks/useCompany';
import { toast }   from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// ─── Schema ───────────────────────────────────────────────────────────────────

const companySchema = z.object({
    name:        z.string().min(1, 'Required'),
    description: z.string().min(1, 'Required'),
    email:       z.string().email('Invalid email'),
    phone:       z.string().min(1, 'Required'),
    website:     z.string().optional(),
    address:     z.string().min(1, 'Required'),
    foundedYear: z.string().optional(),
    facebook:    z.string().optional(),
    instagram:   z.string().optional(),
    twitter:     z.string().optional(),
    linkedin:    z.string().optional(),
});

// ─── Company Form ─────────────────────────────────────────────────────────────

function CompanyForm({ company }) {
    const [logo, setLogo]                            = useState(null);
    const { mutate: createCompany, isPending: creating } = useCreateCompany();
    const { mutate: updateCompany, isPending: updating } = useUpdateCompany();
    const isPending = creating || updating;
    const isEdit    = !!company;

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(companySchema),
        defaultValues: company ? {
            name:        company.name,
            description: company.description,
            email:       company.email,
            phone:       company.phone,
            website:     company.website     || '',
            address:     company.address,
            foundedYear: String(company.foundedYear || ''),
            facebook:    company.socialLinks?.facebook  || '',
            instagram:   company.socialLinks?.instagram || '',
            twitter:     company.socialLinks?.twitter   || '',
            linkedin:    company.socialLinks?.linkedin  || '',
        } : {},
    });

    const onSubmit = (data) => {
        const formData = new FormData();
        Object.entries(data).forEach(([k, v]) => {
            if (v) formData.append(k, v);
        });
        if (logo) formData.append('logo', logo);

        const mutate = isEdit ? updateCompany : createCompany;
        mutate(formData, {
            onSuccess: () => toast.success(`Company info ${isEdit ? 'updated' : 'created'}`),
            onError:   (err) => toast.error(err.response?.data?.message || 'Failed'),
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* Basic info */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                        <Label>Company Name</Label>
                        <Input placeholder="Nordic Car Rentals Oy" {...register('name')} />
                        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <Label>Description</Label>
                        <Textarea
                            placeholder="Describe your company..."
                            rows={3}
                            {...register('description')}
                        />
                        {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label>Founded Year</Label>
                            <Input type="number" placeholder="2010" {...register('foundedYear')} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Logo</Label>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setLogo(e.target.files[0])}
                            />
                            {company?.logo?.url && !logo && (
                                <p className="text-xs text-muted-foreground">Current logo is set</p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Contact */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Contact Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label>Email</Label>
                            <Input
                                type="email"
                                placeholder="info@nordiccars.fi"
                                {...register('email')}
                            />
                            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label>Phone</Label>
                            <Input placeholder="+358 9 100 2000" {...register('phone')} />
                            {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label>Website</Label>
                        <Input placeholder="https://www.nordiccars.fi" {...register('website')} />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Address</Label>
                        <Input placeholder="Mannerheimintie 12, 00100 Helsinki" {...register('address')} />
                        {errors.address && <p className="text-xs text-destructive">{errors.address.message}</p>}
                    </div>
                </CardContent>
            </Card>

            {/* Social links */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Social Links</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                        { name: 'facebook',  label: 'Facebook'  },
                        { name: 'instagram', label: 'Instagram' },
                        { name: 'twitter',   label: 'Twitter'   },
                        { name: 'linkedin',  label: 'LinkedIn'  },
                    ].map((s) => (
                        <div key={s.name} className="space-y-1.5">
                            <Label>{s.label}</Label>
                            <Input
                                placeholder={`https://${s.name}.com/nordiccars`}
                                {...register(s.name)}
                            />
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Button type="submit" size="lg" disabled={isPending} className="w-full sm:w-auto">
                {isPending ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{isEdit ? 'Updating...' : 'Creating...'}</>
                ) : (
                    isEdit ? 'Update Company Info' : 'Create Company'
                )}
            </Button>

        </form>
    );
}

// ─── Company Preview ──────────────────────────────────────────────────────────

function CompanyPreview({ company }) {
    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base">Current Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {company.logo?.url && (
                    <img
                        src={company.logo.url}
                        alt="Logo"
                        className="h-16 w-16 object-contain rounded-xl border"
                    />
                )}
                <div>
                    <p className="font-semibold text-lg">{company.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">{company.description}</p>
                </div>
                <Separator />
                <div className="space-y-2 text-sm">
                    {company.email && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="h-4 w-4" />{company.email}
                        </div>
                    )}
                    {company.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="h-4 w-4" />{company.phone}
                        </div>
                    )}
                    {company.website && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Globe className="h-4 w-4" />{company.website}
                        </div>
                    )}
                    {company.address && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" />{company.address}
                        </div>
                    )}
                    {company.foundedYear && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />Founded {company.foundedYear}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminCompany() {
    const { data: company, isLoading } = useCompany();

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-48" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} className="h-48 w-full rounded-xl" />
                        ))}
                    </div>
                    <Skeleton className="h-64 w-full rounded-xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">Company Settings</h1>
                    <p className="text-muted-foreground text-sm">
                        {company ? 'Update company information' : 'Set up your company profile'}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Form */}
                <div className="lg:col-span-2">
                    <CompanyForm company={company} />
                </div>

                {/* Preview */}
                <div className="space-y-4">
                    {company ? (
                        <CompanyPreview company={company} />
                    ) : (
                        <Card className="border-dashed">
                            <CardContent className="p-6 text-center text-muted-foreground">
                                <Building2 className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                <p className="text-sm">No company info yet</p>
                                <p className="text-xs mt-1">Fill the form to create it</p>
                            </CardContent>
                        </Card>
                    )}
                </div>

            </div>

        </div>
    );
}