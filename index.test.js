"use strict";
// Copyright ©2025 Quinn A Michaels; All rights reserved. 
// Legal Signature Required For Lawful Use.
// Distributed under VLA:31941953695116752336 LICENSE.md
// Vector  Deva test file

const {expect} = require('chai')
const VectorDeva = require('./index.js');

describe(VectorDeva.me.name, () => {
  beforeEach(() => {
    return VectorDeva.init()
  });
  it('Check the DEVA Object', () => {
    expect(VectorDeva).to.be.an('object');
    expect(VectorDeva).to.have.property('agent');
    expect(VectorDeva).to.have.property('vars');
    expect(VectorDeva).to.have.property('listeners');
    expect(VectorDeva).to.have.property('methods');
    expect(VectorDeva).to.have.property('modules');
  });
})
