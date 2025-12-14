'use client';

import { useState } from 'react';
import { SchoolCreationWizard } from '@/components/admin/schools/SchoolCreationWizard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function NewSchoolPage() {
  const [wizardOpen, setWizardOpen] = useState(true);

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Yangi maktab qo'shish</h1>
            <p className="text-muted-foreground mt-1">
              Yangi maktab ma'lumotlarini kiriting
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/admin/schools">Orqaga</Link>
          </Button>
        </div>
        <SchoolCreationWizard open={wizardOpen} onOpenChange={setWizardOpen} />
      </div>
    </div>
  );
}
