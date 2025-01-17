import { Button, NonIdealState, Spinner } from '@blueprintjs/core';
import { Breadcrumbs2, Tooltip2 } from '@blueprintjs/popover2';
import { subject } from '@casl/ability';
import { LightdashMode } from '@lightdash/common';
import { Stack } from '@mantine/core';
import { IconLayoutDashboard } from '@tabler/icons-react';
import { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Redirect, useHistory, useParams } from 'react-router-dom';
import DashboardCreateModal from '../components/common/modal/DashboardCreateModal';
import Page from '../components/common/Page/Page';
import {
    PageBreadcrumbsWrapper,
    PageHeader,
} from '../components/common/Page/Page.styles';
import ResourceView from '../components/common/ResourceView';
import {
    ResourceViewItemType,
    wrapResourceView,
} from '../components/common/ResourceView/resourceTypeUtils';
import { SortDirection } from '../components/common/ResourceView/ResourceViewList';
import { useCreateMutation } from '../hooks/dashboard/useDashboard';
import { useDashboards } from '../hooks/dashboard/useDashboards';
import { useSpaces } from '../hooks/useSpaces';
import { useApp } from '../providers/AppProvider';

export const DEFAULT_DASHBOARD_NAME = 'Untitled dashboard';

const SavedDashboards = () => {
    const history = useHistory();
    const { projectUuid } = useParams<{ projectUuid: string }>();
    const { isLoading, data: dashboards = [] } = useDashboards(projectUuid);
    const [isCreateDashboardOpen, setIsCreateDashboardOpen] =
        useState<boolean>(false);

    const {
        isLoading: isCreatingDashboard,
        isSuccess: hasCreatedDashboard,
        mutate: createDashboard,
        data: newDashboard,
    } = useCreateMutation(projectUuid);

    const { user, health } = useApp();
    const isDemo = health.data?.mode === LightdashMode.DEMO;
    const { data: spaces, isLoading: isLoadingSpaces } = useSpaces(projectUuid);
    const hasNoSpaces = spaces && spaces.length === 0;

    const userCanManageDashboards = user.data?.ability?.can(
        'manage',
        subject('Dashboard', {
            organizationUuid: user.data?.organizationUuid,
            projectUuid,
        }),
    );

    if (isLoading || isLoadingSpaces) {
        return (
            <div style={{ marginTop: '20px' }}>
                <NonIdealState title="Loading dashboards" icon={<Spinner />} />
            </div>
        );
    }

    if (hasCreatedDashboard && newDashboard) {
        return (
            <Redirect
                push
                to={`/projects/${projectUuid}/dashboards/${newDashboard.uuid}`}
            />
        );
    }

    const handleCreateDashboard = () => {
        setIsCreateDashboardOpen(true);
    };

    return (
        <Page>
            <Helmet>
                <title>Dashboards - Lightdash</title>
            </Helmet>

            <Stack spacing="xl" w={900}>
                <PageHeader>
                    <PageBreadcrumbsWrapper>
                        <Breadcrumbs2
                            items={[
                                {
                                    href: '/home',
                                    text: 'Home',
                                    className: 'home-breadcrumb',
                                    onClick: (e) => {
                                        history.push('/home');
                                    },
                                },
                                {
                                    text: 'All dashboards',
                                },
                            ]}
                        />
                    </PageBreadcrumbsWrapper>

                    {dashboards.length > 0 &&
                        userCanManageDashboards &&
                        !isDemo && (
                            <Tooltip2
                                content={
                                    hasNoSpaces
                                        ? 'First you must create a space for this dashboard'
                                        : undefined
                                }
                                interactionKind="hover"
                            >
                                <Button
                                    icon="plus"
                                    loading={isCreatingDashboard}
                                    onClick={handleCreateDashboard}
                                    disabled={hasNoSpaces}
                                    intent="primary"
                                >
                                    Create dashboard
                                </Button>
                            </Tooltip2>
                        )}
                </PageHeader>

                <DashboardCreateModal
                    projectUuid={projectUuid}
                    isOpen={isCreateDashboardOpen}
                    onClose={() => setIsCreateDashboardOpen(false)}
                    onConfirm={(dashboard) => {
                        history.push(
                            `/projects/${projectUuid}/dashboards/${dashboard.uuid}/edit`,
                        );

                        setIsCreateDashboardOpen(false);
                    }}
                />

                <ResourceView
                    items={wrapResourceView(
                        dashboards,
                        ResourceViewItemType.DASHBOARD,
                    )}
                    listProps={{
                        defaultSort: { updatedAt: SortDirection.DESC },
                    }}
                    emptyStateProps={{
                        icon: <IconLayoutDashboard size={30} />,
                        title: 'No dashboards added yet',
                        action:
                            userCanManageDashboards && !isDemo ? (
                                <Tooltip2
                                    content={
                                        hasNoSpaces
                                            ? 'First you must create a space for this dashboard'
                                            : undefined
                                    }
                                    interactionKind="hover"
                                >
                                    <Button
                                        icon="plus"
                                        loading={isCreatingDashboard}
                                        onClick={handleCreateDashboard}
                                        disabled={hasNoSpaces}
                                        intent="primary"
                                    >
                                        Create dashboard
                                    </Button>
                                </Tooltip2>
                            ) : undefined,
                    }}
                />
            </Stack>
        </Page>
    );
};

export default SavedDashboards;
