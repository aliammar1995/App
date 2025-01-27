import _ from 'underscore';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import ScreenWrapper from '../../components/ScreenWrapper';
import * as Wallet from '../../libs/actions/Wallet';
import ONYXKEYS from '../../ONYXKEYS';
import FullScreenLoadingIndicator from '../../components/FullscreenLoadingIndicator';
import CONST from '../../CONST';
import userWalletPropTypes from './userWalletPropTypes';
import {withNetwork} from '../../components/OnyxProvider';
import networkPropTypes from '../../components/networkPropTypes';

// Steps
import OnfidoStep from './OnfidoStep';
import AdditionalDetailsStep from './AdditionalDetailsStep';
import TermsStep from './TermsStep';
import ActivateStep from './ActivateStep';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import FailedKYC from './FailedKYC';
import compose from '../../libs/compose';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';

const propTypes = {
    /** Information about the network from Onyx */
    network: networkPropTypes.isRequired,

    /** The user's wallet */
    userWallet: userWalletPropTypes,

    ...withLocalizePropTypes,
};

const defaultProps = {
    userWallet: {},
};

class EnablePaymentsPage extends React.Component {
    componentDidMount() {
        Wallet.openEnablePaymentsPage();
    }

    componentDidUpdate(prevProps) {
        if (!prevProps.network.isOffline || this.props.network.isOffline) {
            return;
        }

        Wallet.openEnablePaymentsPage();
    }

    render() {
        if (_.isEmpty(this.props.userWallet)) {
            return <FullScreenLoadingIndicator />;
        }

        return (
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                testID={EnablePaymentsPage.displayName}
            >
                {() => {
                    if (this.props.userWallet.errorCode === CONST.WALLET.ERROR.KYC) {
                        return (
                            <>
                                <HeaderWithBackButton
                                    title={this.props.translate('additionalDetailsStep.headerTitle')}
                                    onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_WALLET)}
                                />
                                <FailedKYC />
                            </>
                        );
                    }

                    if (this.props.userWallet.shouldShowWalletActivationSuccess) {
                        return <ActivateStep userWallet={this.props.userWallet} />;
                    }

                    const currentStep = this.props.userWallet.currentStep || CONST.WALLET.STEP.ADDITIONAL_DETAILS;

                    return (
                        <>
                            {(currentStep === CONST.WALLET.STEP.ADDITIONAL_DETAILS || currentStep === CONST.WALLET.STEP.ADDITIONAL_DETAILS_KBA) && <AdditionalDetailsStep />}
                            {currentStep === CONST.WALLET.STEP.ONFIDO && <OnfidoStep />}
                            {currentStep === CONST.WALLET.STEP.TERMS && <TermsStep />}
                            {currentStep === CONST.WALLET.STEP.ACTIVATE && <ActivateStep userWallet={this.props.userWallet} />}
                        </>
                    );
                }}
            </ScreenWrapper>
        );
    }
}

EnablePaymentsPage.propTypes = propTypes;
EnablePaymentsPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        userWallet: {
            key: ONYXKEYS.USER_WALLET,

            // We want to refresh the wallet each time the user attempts to activate the wallet so we won't use the
            // stored values here.
            initWithStoredValues: false,
        },
    }),
    withNetwork(),
)(EnablePaymentsPage);
