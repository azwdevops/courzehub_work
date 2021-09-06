task_status = (
    ('', 'select status'),
    ('available', 'available'),
    ('completed', 'completed'),
    ('draft', 'draft'),
    ('submitted', 'submitted'),
    ('suspended', 'suspended'),
)

submission_status = (
    ('', 'select status'),
    ('approved', 'approved'),
    ('draft', 'draft'),
    ('rejected', 'rejected'),
    ('submitted', 'submitted'),
)

worker_application_status = (
    ('', 'select status'),
    ('approved', 'approved'),
    ('pending', 'pending'),
    ('rejected', 'rejected'),
)

worker_profile_status = (
    ('', 'select status'),
    ('active', 'active'),
    ('suspended', 'suspended'),
    ('disabled', 'disabled')
)
