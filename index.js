'use strict';

import React from 'react';
import PropTypes from 'prop-types';

import {
    View,
    Modal,
    Text,
    ScrollView,
    TouchableOpacity,
    TouchableWithoutFeedback,
    ViewPropTypes as RNViewPropTypes,
    Switch
} from 'react-native';

import styles from './style';
import BaseComponent from './BaseComponent';

const ViewPropTypes = RNViewPropTypes || View.propTypes;

let componentIndex = 0;

const propTypes = {
    data:                      PropTypes.array,
    onChange:                  PropTypes.func,
    initValue:                 PropTypes.string,
    animationType:             Modal.propTypes.animationType,
    style:                     ViewPropTypes.style,
    selectStyle:               ViewPropTypes.style,
    selectTextStyle:           Text.propTypes.style,
    optionStyle:               ViewPropTypes.style,
    optionTextStyle:           Text.propTypes.style,
    optionContainerStyle:      ViewPropTypes.style,
    sectionStyle:              ViewPropTypes.style,
    sectionTextStyle:          Text.propTypes.style,
    cancelStyle:               ViewPropTypes.style,
    cancelTextStyle:           Text.propTypes.style,
    overlayStyle:              ViewPropTypes.style,
    cancelText:                PropTypes.string,
    multiSelect:               PropTypes.bool,
    disabled:                  PropTypes.bool,
    multiSelectPlaceholderText: PropTypes.string,
    supportedOrientations:     PropTypes.arrayOf(PropTypes.oneOf(['portrait', 'landscape', 'portrait-upside-down', 'landscape-left', 'landscape-right'])),
    keyboardShouldPersistTaps: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    backdropPressToClose:      PropTypes.bool,
};

const defaultProps = {
    data:                      [],
    onChange:                  () => {},
    onChangeMultiSelect:       () => {},
    initValue:                 'Select me!',
    animationType:             'slide',
    style:                     {},
    selectStyle:               {},
    selectTextStyle:           {},
    optionStyle:               {},
    optionTextStyle:           {},
    optionContainerStyle:      {},
    sectionStyle:              {},
    sectionTextStyle:          {},
    cancelStyle:               {},
    cancelTextStyle:           {},
    overlayStyle:              {},
    cancelText:                'cancel',
    disabled:                  false,
    multiSelect:               false,
    multiSelectPlaceholderText: "Select something",
    supportedOrientations:     ['portrait', 'landscape'],
    keyboardShouldPersistTaps: 'always',
    backdropPressToClose:      false,
};

export default class ModalSelector extends BaseComponent {

    constructor() {

        super();

        this._bind(
            'onChange',
            'onChangeMultiSelect',
            'open',
            'close',
            'renderChildren',
            'renderChildrenMultiSelect'
        );

        this.state = {
            modalVisible:  false,
            transparent:   false,
            multiSelected: {},
            selected:      'please select',
        };
    }

    componentDidMount() {
        if(!this.props.multiSelect)
            this.setState({selected: this.props.initValue});
        else
            this.setState({multiSelected: this.props.multiSelected});
        this.setState({cancelText: this.props.cancelText});
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.initValue !== this.props.initValue) {
            if(!this.props.multiSelect)
                this.setState({selected: nextProps.initValue});
            else
                this.setState({multiSelected: nextProps.initValue});
        }
    }

    onChange(item) {
        this.props.onChange(item);
        this.setState({selected: item.label});
        this.close();
    }

    onChangeMultiSelect(selected, item) {
        let multiSelected = this.state.multiSelected;
        if(selected)
            multiSelected = {...this.state.multiSelected, [item.key]: item };
        else {
            multiSelected = {...this.state.multiSelected};
            delete multiSelected[item.key];
        }
        this.props.onChangeMultiSelect(multiSelected);
        this.setState({multiSelected,});
    }
    
    close() {
        this.setState({
            modalVisible: false,
        });
    }

    open() {
        this.setState({
            modalVisible: true,
        });
    }

    renderSection(section) {
        return (
            <View key={section.key} style={[styles.sectionStyle,this.props.sectionStyle]}>
                <Text style={[styles.sectionTextStyle,this.props.sectionTextStyle]}>{section.label}</Text>
            </View>
        );
    }

    renderOption(option) {
        return (
            <TouchableOpacity key={option.key} onPress={() => this.onChange(option)}>
                <View style={[styles.optionStyle, this.props.optionStyle]}>
                    <Text style={[styles.optionTextStyle,this.props.optionTextStyle]}>{option.label}</Text>
                </View>
            </TouchableOpacity>);
    }

    renderOptionList() {
        let options = this.props.data.map(item => {
            if (item.section) {
                return this.renderSection(item);
            }
            return this.renderOption(item);

        });

        const closeOverlay = this.props.backdropPressToClose;

        return (
            <TouchableWithoutFeedback key={'modalSelector' + (componentIndex++)} onPress={() => {closeOverlay && this.close()}}>
                <View style={[styles.overlayStyle, this.props.overlayStyle]}>
                    <View style={[styles.optionContainer, this.props.optionContainerStyle]}>
                        <ScrollView keyboardShouldPersistTaps={this.props.keyboardShouldPersistTaps}>
                            <View style={{paddingHorizontal: 10}}>
                                {options}
                            </View>
                        </ScrollView>
                    </View>
                    <View style={styles.cancelContainer}>
                        <TouchableOpacity onPress={this.close}>
                            <View style={[styles.cancelStyle, this.props.cancelStyle]}>
                                <Text style={[styles.cancelTextStyle,this.props.cancelTextStyle]}>{this.props.cancelText}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>);
    }

    renderChildren() {

        if(this.props.children) {
            return this.props.children;
        }
        return (
            <View style={[styles.selectStyle, this.props.selectStyle]}>
                <Text style={[styles.selectTextStyle, this.props.selectTextStyle]}>{this.state.selected}</Text>
            </View>
        );
    }
    
    renderOptionWithCheckbox(option) {
        return (
            <View key={option.key} style={[styles.optionWithCheckboxStyle, this.props.optionWithCheckboxStyle]}>
                <Text style={[styles.optionTextStyle,this.props.optionTextStyle]}>{option.label}</Text>
                <Switch value={!!this.state.multiSelected[option.key]} onValueChange={(value) => this.onChangeMultiSelect(value, option)}/>
            </View>
        );
    }
    
    renderOptionsMultiSelect() {
        let options = this.props.data.map(item => {
            if (item.section) {
                return this.renderSection(item);
            }
            return this.renderOptionWithCheckbox(item);

        });

        const closeOverlay = this.props.backdropPressToClose;

        return (
            <TouchableWithoutFeedback key={'modalSelector' + (componentIndex++)} onPress={() => {closeOverlay && this.close()}}>
                <View style={[styles.overlayStyle, this.props.overlayStyle]}>
                    <View style={[styles.optionContainer, this.props.optionContainerStyle]}>
                        <ScrollView keyboardShouldPersistTaps={this.props.keyboardShouldPersistTaps}>
                            <View style={{paddingHorizontal: 10}}>
                                {options}
                            </View>
                        </ScrollView>
                    </View>
                    <View style={styles.cancelContainer}>
                        <TouchableOpacity onPress={this.close}>
                            <View style={[styles.cancelStyle, this.props.cancelStyle]}>
                                <Text style={[styles.cancelTextStyle,this.props.cancelTextStyle]}>{"Done"}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>);
    }
    
    renderChildrenMultiSelect() {

        if(this.props.children) {
            return this.props.children;
        }
        let multiSelected = this.state.multiSelected;
        let selection = Object.keys(multiSelected).length > 0?Object.keys(multiSelected).map((k)=>multiSelected[k].label).join(","):this.props.multiSelectPlaceholderText;
        return (
            <View style={[styles.selectStyle, this.props.selectStyle]}>
                <Text style={[styles.selectTextStyle, this.props.selectTextStyle]}>{selection}</Text>
            </View>
        );
    }
    
    render() {

        const dp = (
            <Modal
                transparent={true}
                ref={element => this.model = element}
                supportedOrientations={this.props.supportedOrientations}
                visible={this.state.modalVisible}
                onRequestClose={this.close}
                animationType={this.props.animationType}
            >
                {!this.props.multiSelect?this.renderOptionList():this.renderOptionsMultiSelect()}
            </Modal>
        );

        return (
            <View style={this.props.style}>
                {dp}
                <TouchableOpacity onPress={this.open} disabled={this.props.disabled}>
                    <View pointerEvents="none">
                        {!this.props.multiSelect?this.renderChildren():this.renderChildrenMultiSelect()}
                    </View>
                </TouchableOpacity>
            </View>
        );
    }
}

ModalSelector.propTypes = propTypes;
ModalSelector.defaultProps = defaultProps;
