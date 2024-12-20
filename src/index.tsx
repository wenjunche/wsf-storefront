import { fin } from '@openfin/core';
import { RegistrationMetaInfo, Storefront, StorefrontProvider } from '@openfin/workspace';
import { BrowserInitConfig, init as workspacePlatformInit } from '@openfin/workspace-platform';

window.addEventListener("DOMContentLoaded",  async () => {
    initWorkspace();
});

const initWorkspace = async() => {
    fin.Window.getCurrentSync().showDeveloperTools();
    console.log("Initializing Workspace Platform");
    let platform = fin.Platform.getCurrentSync();
    platform.once("platform-api-ready", () => {
        initStorefront();
    });
  
    const browser: BrowserInitConfig = {};
    await workspacePlatformInit({ browser });    
}

const initStorefront = async() => {
    const provider = getStorefrontProvider();

    Storefront.register(provider).then((meta: RegistrationMetaInfo) => {
        console.log('Storefront registered with Workspace version', meta.workspaceVersion);
        Storefront.deregister(provider.id).then(() => {
            console.log('Storefront deregistered,  will re-register in 5 seconds');
            setTimeout(() => {
                initStorefront();
            }, 5000);
        }).catch((error) => {
            console.error('Error deregistering Storefront', error);
        });
    }).catch((error) => {
        console.error('Error registering Storefront', error);
    });
}

const getStorefrontProvider = (): StorefrontProvider => ({
    id: 'simple-storefront-provider',
    title: 'simple-storefront-provider',
    icon: 'https://openfin.co/favicon.ico',
    getApps: function (): Promise<Storefront.App[]> {
        throw new Error('getApps not implemented.');
    },
    getLandingPage: function (): Promise<Storefront.StorefrontLandingPage> {
        throw new Error('getLandingPage not implemented.');
    },
    getNavigation: function (): Promise<[Storefront.StorefrontNavigationSection?, Storefront.StorefrontNavigationSection?, Storefront.StorefrontNavigationSection?]> {
        throw new Error('getNavigation not implemented.');
    },
    getFooter: function (): Promise<Storefront.StorefrontFooter> {
        throw new Error('getFooter not implemented.');
    },
    launchApp: function (app: Storefront.App): Promise<void> {
        throw new Error('launchApp not implemented.');
    }
});