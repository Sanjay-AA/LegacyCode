import React, { Component } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default class LegacyCounterScreen extends Component {
  state = { count: 0 };

  render() {
    return (
      <View style={styles.container}>
        <Text>Count: {this.state.count}</Text>
        <TouchableOpacity onPress={() => this.setState({ count: this.state.count + 1 })}>
          <Text>Increment</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' }
});
