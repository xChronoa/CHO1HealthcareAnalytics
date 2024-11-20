<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\AgeCategory;
use App\Models\Barangay;
use App\Models\ReportSubmission;
use App\Models\ReportSubmissionTemplate;
use App\Models\ReportStatus;
use App\Models\M1_Report\FamilyPlanningMethods;
use App\Models\M1_Report\Service;
use App\Models\M2_Report\Disease;

class ReportTestDataFactory
{
    public static function createBaseData()
    {
        $barangay = Barangay::create([
            'barangay_name' => 'Barangay 1',
        ]);

        $admin = User::create([
            'username' => 'adminuser',
            'password' => bcrypt('password'),
            'email' => 'admin@example.com',
            'role' => 'admin',
            'barangay_id' => null,
            'status' => 'active',
        ]);

        $encoder = User::create([
            'username' => 'encoderuser',
            'password' => bcrypt('password'),
            'email' => 'encoder@example.com',
            'role' => 'encoder',
            'barangay_id' => $barangay->barangay_id,
            'status' => 'active',
        ]);

        return [
            'barangay' => $barangay,
            'admin' => $admin,
            'encoder' => $encoder,
        ];
    }

    public static function createReferenceData()
    {
        return [
            'age_category' => AgeCategory::create(['age_category' => '15-19']),
            'fp_method' => FamilyPlanningMethods::create([
                'method_id' => 1,
                'method_name' => 'Contraceptive Pill'
            ]),
            'service' => Service::create([
                'service_id' => 1,
                'service_name' => 'Immunization'
            ]),
            'disease' => Disease::create([
                'disease_id' => 1,
                'disease_name' => 'Malaria'
            ]),
        ];
    }

    public static function createReportTemplates($adminId)
    {
        $templates = [];
        foreach (['m1', 'm2'] as $type) {
            $templates[$type] = ReportSubmissionTemplate::create([
                'admin_id' => $adminId,
                'report_type' => $type,
                'report_year' => 2024,
                'report_month' => 6,
            ]);
        }
        return $templates;
    }

    public static function createSubmissionsAndStatuses($templates, $barangayId, $encoderId)
    {
        $data = [];
        foreach ($templates as $type => $template) {
            $submission = ReportSubmission::create([
                'report_submission_template_id' => $template->report_submission_template_id,
                'barangay_id' => $barangayId,
                'due_at' => now()->addDays(7),
                'status' => 'pending',
            ]);

            $status = ReportStatus::create([
                'report_submission_id' => $submission->report_submission_id,
                'status' => 'pending',
                'user_id' => $encoderId,
            ]);

            $data[$type] = [
                'submission' => $submission,
                'status' => $status,
            ];
        }
        return $data;
    }
}

class ReportPayloadFactory
{
    public static function getValidPayload($m1ReportId, $m2ReportId)
    {
        return [
            'm1Report' => [
                'projectedPopulation' => 1000,
                'wra' => [
                    [
                        'age_category' => '15-19',
                        'unmet_need_modern_fp' => 50
                    ]
                ],
                'familyplanning' => [
                    [
                        'age_category' => '15-19',
                        'fp_method_id' => 1,
                        'current_users_beginning_month' => 100,
                        'new_acceptors_prev_month' => 10,
                        'other_acceptors_present_month' => 5,
                        'drop_outs_present_month' => 2,
                        'current_users_end_month' => 113,
                        'new_acceptors_present_month' => 15
                    ]
                ],
                'servicedata' => [
                    [
                        'service_id' => 1,
                        'value' => 200,
                        'remarks' => 'Test remark'
                    ]
                ]
            ],
            'm2Report' => [
                [
                    'disease_id' => 1,
                    'disease_name' => 'Test Disease',
                    'age_category_id' => 1,
                    'male' => 10,
                    'female' => 15
                ]
            ],
            'm1ReportId' => $m1ReportId,
            'm2ReportId' => $m2ReportId
        ];
    }

    public static function getInvalidPayload($m1ReportId, $m2ReportId)
    {
        return [
            'm1Report' => [
                'projectedPopulation' => 'invalid',
                'wra' => [
                    [
                        'age_category' => 'invalid_category',
                        'unmet_need_modern_fp' => 'invalid'
                    ]
                ]
            ],
            'm2Report' => [
                [
                    'disease_id' => 999,
                    'disease_name' => 'Invalid Disease',
                    'age_category_id' => 999,
                    'male' => 'invalid',
                    'female' => 'invalid'
                ]
            ],
            'm1ReportId' => $m1ReportId,
            'm2ReportId' => $m2ReportId
        ];
    }

    public static function getValidM1Data()
    {
        return [
            'projectedPopulation' => 1000,
            'wra' => [
                [
                    'age_category_id' => 1,
                    'unmet_need_modern_fp' => 50
                ]
            ],
            'familyplanning' => [
                [
                    'age_category_id' => 1,
                    'fp_method_id' => 1,
                    'current_users_beginning_month' => 100
                ]
            ],
            'servicedata' => [
                [
                    'service_id' => 1,
                    'value' => 200
                ]
            ]
        ];
    }

    public static function getValidM2Data()
    {
        return [
            [
                'disease_id' => 1,
                'age_category_id' => 1,
                'male' => 10,
                'female' => 15
            ]
        ];
    }
}